import { getSetting, R } from "foundry-pf2e";
import { TriggerEventAction } from "./actions/base";
import { AuraEnterTriggerEvent, AuraLeaveTriggerEvent } from "./events/aura";
import { TriggerEvent } from "./events/base";
import { TurnEndTriggerEvent, TurnStartTriggerEvent } from "./events/turn";
import { RollDamageAction } from "./actions/roll-damage";
import { RollSaveAction } from "./actions/roll-save";

const TRIGGER_INPUT_DEFAULT_VALUES = {
    text: "",
    uuid: "",
    checkbox: false,
    select: "",
    number: 0,
};

const EVENTS = [
    AuraEnterTriggerEvent,
    AuraLeaveTriggerEvent,
    TurnStartTriggerEvent,
    TurnEndTriggerEvent,
] as const;

const EVENTS_MAP: Map<TriggerEventType, TriggerEvent> = new Map(
    EVENTS.map((EventCls) => {
        const event = new EventCls();
        return [event.id, event] as const;
    })
);

const ACTIONS = [RollDamageAction, RollSaveAction] as const;

const ACTIONS_MAP: Map<TriggerActionType, TriggerEventAction> = new Map(
    ACTIONS.map((ActionCls) => {
        const action = new ActionCls();
        return [action.type, action];
    })
);

const EVENT_TRIGGERS: Collection<Trigger[]> = new Collection();

function prepareTriggers() {
    EVENT_TRIGGERS.clear();

    const allTriggers = foundry.utils.deepClone(getSetting<Trigger[]>("customTriggers"));

    for (const event of EVENTS_MAP.values()) {
        const eventId = event.id;

        if (!EVENT_TRIGGERS.has(eventId)) {
            // TODO more validation ?
            const triggers = R.pipe(
                allTriggers,
                R.filter((trigger) => trigger.event === eventId),
                R.forEach((trigger) => {
                    R.forEachObj(trigger.usedConditions, (used, triggerCondition) => {
                        if (!used) {
                            trigger.conditions[triggerCondition] = undefined;
                        }
                    });

                    R.forEach(trigger.actions, (triggerAction) => {
                        R.forEachObj(triggerAction.usedOptions, (used, optionName: string) => {
                            if (!used) {
                                triggerAction.options[optionName] = undefined;
                            }
                        });
                    });
                })
            );

            EVENT_TRIGGERS.set(eventId, triggers);

            event._enable(triggers.length > 0, triggers);
        }
    }
}

async function runTrigger<TEventId extends TriggerEventType>(
    eventId: TEventId,
    actor: ActorPF2e,
    options: TriggerRunOptions
) {
    const event = EVENTS_MAP.get(eventId);
    const triggers = EVENT_TRIGGERS.get(eventId);
    if (!event || !triggers?.length) return;

    Promise.all(
        triggers.map(async (trigger: Trigger) => {
            const valid = await event.test(actor, trigger, options);
            if (!valid) return;

            for (let i = 0; i < trigger.actions.length; i++) {
                const triggerAction = trigger.actions[i];
                const action = ACTIONS_MAP.get(triggerAction.type);
                if (!action) continue;

                const nextAction = trigger.actions.at(i + 1);
                const fn = () =>
                    action.execute(actor, trigger, triggerAction, nextAction?.linkOption, options);

                if (nextAction?.linked) {
                    const canContinue = await fn();
                    if (!canContinue) {
                        i++;
                        while (trigger.actions.at(i + 1)?.linked) {
                            i++;
                        }
                    }
                } else {
                    fn();
                }
            }
        })
    );
}

function createInputEntries(
    inputEntries: Readonly<TriggerInputEntry[]>,
    usedEntries: Record<string, boolean>
) {
    return R.flatMap(inputEntries, (entry) => {
        const entries: [string, TriggerInputValueType][] = [];
        const name = entry.name;
        const value = defaultInputValue(entry);

        entries.push([name, value] as const);

        usedEntries[name] = !!entry.required;

        const subInputs = getSubInputs(entry, value);
        if (subInputs) {
            const subEntries = createInputEntries(subInputs, usedEntries);
            entries.push(...subEntries);
        }

        return entries;
    });
}

function getSubInputs(entry: TriggerInputEntry, value: TriggerInputValueType) {
    if (entry.type !== "select" || R.isNullish(value)) return;

    return entry.options.find(
        (option): option is { value: string; subInputs: TriggerInputEntry[] } =>
            R.isPlainObject(option) && option.value === value && R.isArray(option.subInputs)
    )?.subInputs;
}

function createTrigger<TType extends TriggerEventType>(type: TType): Trigger | undefined {
    const event = EVENTS_MAP.get(type);
    if (!event) return;

    const usedConditions = {} as Record<string, boolean>;
    const conditions = R.fromEntries(createInputEntries(event.conditions, usedConditions));

    return {
        event: type,
        conditions,
        actions: [],
        usedConditions,
    };
}

function createAction<TType extends TriggerActionType>(type: TType): TriggerAction | undefined {
    const action = ACTIONS_MAP.get(type);
    if (!action) return;

    const usedOptions = {} as Record<string, boolean>;
    const options = R.fromEntries(createInputEntries(action.options, usedOptions));

    return {
        type,
        options,
        usedOptions,
        linked: false,
    };
}

function defaultInputValue(input: TriggerInputEntry): TriggerInputValueType {
    if (!input.required) {
        return undefined;
    }

    if (input.default) {
        return input.default;
    }

    if (input.type === "select") {
        const entry = input.options[0];
        return R.isString(entry) ? entry : entry.value;
    }

    return TRIGGER_INPUT_DEFAULT_VALUES[input.type];
}

function isInputType(type: TriggerInputType, value: TriggerInputValueType) {
    return typeof value === typeof TRIGGER_INPUT_DEFAULT_VALUES[type];
}

type Trigger = {
    event: TriggerEventType;
    conditions: Record<string, TriggerInputValueType>;
    usedConditions: Record<string, boolean>;
    actions: TriggerAction[];
};

type ExtractTriggerInputs<TInputs extends Readonly<TriggerInputEntry[]>> = TInputs extends Readonly<
    { name: infer TName extends string }[]
>
    ? {
          [k in TName]: ExtractTriggerInput<Extract<TInputs[number], { name: k }>>;
      }
    : never;

type ExtractTriggerInput<TInput extends TriggerInputEntry> = TInput extends {
    required: true;
}
    ? ExtractTriggerInputValue<TInput>
    : ExtractTriggerInputValue<TInput> | undefined;

type ExtractTriggerInputValue<TInput extends TriggerInputEntry> = TInput extends {
    type: infer TType extends TriggerInputType;
}
    ? TType extends "select"
        ? TInput extends { options: infer TOption extends string[] }
            ? TOption[number]
            : TInput extends { options: { value: infer TOption extends string }[] }
            ? TOption
            : never
        : TriggerInputValueTypes[TType]
    : never;

type ExtractSubInputs<TInputs extends Readonly<TriggerInputEntry[]>> = TInputs extends Readonly<
    {
        type: "select";
        options: infer TOptions extends Readonly<TriggerInputSelect["options"]>;
    }[]
>
    ? TOptions extends { subInputs: infer TSubInput extends Readonly<TriggerInputEntry[]> }[]
        ? ExtractTriggerInputs<TSubInput>
        : {}
    : {};

type TriggerInputValueTypes = typeof TRIGGER_INPUT_DEFAULT_VALUES;

type TriggerInputValueType = TriggerInputValueTypes[keyof TriggerInputValueTypes] | undefined;

type Triggers = TriggerEvents extends { id: infer TEventId extends TriggerEventType }
    ? {
          [k in TEventId]: Extract<TriggerEvents, { id: k }> extends {
              conditions: infer TConditions extends Readonly<TriggerInputEntry[]>;
          }
              ? {
                    event: k;
                    conditions: ExtractTriggerInputs<TConditions> & ExtractSubInputs<TConditions>;
                    actions: TriggerAction[];
                    usedConditions: { [c in keyof ExtractTriggerInputs<TConditions>]: boolean };
                }
              : never;
      }
    : never;

type TriggerEvents = InstanceType<(typeof EVENTS)[number]>;

type TriggerEventType = TriggerEvents["id"];

type TriggerEventActions = InstanceType<(typeof ACTIONS)[number]>;

type TriggerActionType = TriggerEventActions["type"];

type TriggerActions = TriggerEventActions extends { type: infer TType extends TriggerActionType }
    ? {
          [k in TType]: Extract<TriggerEventActions, { type: k }> extends {
              options: infer TOptions extends Readonly<TriggerInputEntry[]>;
          }
              ? {
                    type: k;
                    options: ExtractTriggerInputs<TOptions>;
                    linked: boolean;
                    linkOption?: TriggerInputValueType;
                    usedOptions: { [c in keyof ExtractTriggerInputs<TOptions>]: boolean };
                }
              : never;
      }
    : never;

type TriggerRunOptions = Merge<
    Parameters<TriggerEventActions["execute"]>[4] & Parameters<TriggerEvents["test"]>[2]
>;

type TriggerAction = {
    type: TriggerActionType;
    options: Record<string, TriggerInputValueType>;
    linked: boolean;
    linkOption?: TriggerInputValueType;
    usedOptions: Record<string, boolean>;
};

type TriggerInputEntry =
    | TriggerInputText
    | TriggerInputUuid
    | TriggerInputToggle
    | TriggerInputSelect
    | TriggerInputNumber;

type TriggerInputEntryBase<TType extends TriggerInputType> = {
    name: string;
    type: TType;
    required?: boolean;
    default?: TriggerInputValueTypes[TType];
};

type TriggerInputText = TriggerInputEntryBase<"text">;

type TriggerInputNumber = TriggerInputEntryBase<"number"> & {
    min?: number;
    max?: number;
    step?: number;
};

type TriggerInputUuid = TriggerInputEntryBase<"uuid">;

type TriggerInputToggle = TriggerInputEntryBase<"checkbox"> & {
    default?: boolean;
};

type TriggerInputSelect = TriggerInputEntryBase<"select"> & {
    options: (
        | string
        | {
              value: string;
              label?: string;
              subInputs?: TriggerInputEntry[] | Readonly<TriggerInputEntry[]>;
          }
    )[];
    localize?: boolean;
};

type TriggerInputType = "number" | "text" | "uuid" | "checkbox" | "select";

export {
    ACTIONS_MAP,
    createAction,
    createInputEntries,
    createTrigger,
    defaultInputValue,
    EVENT_TRIGGERS,
    EVENTS_MAP,
    getSubInputs,
    isInputType,
    prepareTriggers,
    runTrigger,
};

export type {
    ExtractTriggerInputs,
    Trigger,
    TriggerAction,
    TriggerActions,
    TriggerActionType,
    TriggerEventType,
    TriggerInputEntry,
    TriggerInputType,
    TriggerInputValueType,
    TriggerRunOptions,
    Triggers,
};
