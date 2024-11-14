import { getSetting, R } from "foundry-pf2e";
import { ACTIONS_MAP, TriggerAction } from "./action";
import { AuraEnterTriggerEvent, AuraLeaveTriggerEvent } from "./events/aura";
import { TriggerEvent } from "./events/base";

const TRIGGER_INPUT_DEFAULT_VALUES = {
    text: "",
    uuid: "",
    checkbox: false,
    select: "",
    number: 0,
};

const EVENTS = [AuraEnterTriggerEvent, AuraLeaveTriggerEvent] as const;

const EVENTS_MAP: Map<TriggerEventType, TriggerEvent> = new Map(
    R.pipe(
        EVENTS,
        R.map((EventCls) => {
            const event = new EventCls();
            return [event.id, event] as const;
        })
    )
);

const EVENT_TRIGGERS: Collection<Trigger[]> = new Collection();

function prepareTriggers() {
    EVENT_TRIGGERS.clear();

    const allTriggers = foundry.utils.deepClone(getSetting<Trigger[]>("customTriggers"));

    for (const event of EVENTS_MAP.values()) {
        const eventId = event.id;

        if (!EVENT_TRIGGERS.has(eventId)) {
            // TODO more validation ?
            const eventTriggers = R.pipe(
                allTriggers,
                R.filter((trigger) => trigger.event === eventId),
                R.forEach((trigger) => {
                    const conditions = trigger.conditions;

                    R.forEachObj(trigger.usedConditions, (used, condition) => {
                        if (!used && condition in conditions) {
                            conditions[condition] = undefined;
                        }
                    });

                    for (let i = 0; i < trigger.actions.length; i++) {
                        const triggerAction = trigger.actions[i];
                        const action = ACTIONS_MAP.get(triggerAction.type);
                        if (!action) continue;

                        R.forEachObj(triggerAction.usedOptions, (used, optionName: string) => {
                            if (!used) {
                                triggerAction.options[optionName] = undefined;
                            }
                        });
                    }
                })
            );

            EVENT_TRIGGERS.set(eventId, eventTriggers);

            event._enable(eventTriggers.length > 0);
        }
    }
}

async function runTrigger<TEventId extends TriggerEventType>(
    eventId: TEventId,
    actor: ActorPF2e,
    options: Record<string, any>
) {
    const event = EVENTS_MAP.get(eventId);
    const triggers = EVENT_TRIGGERS.get(eventId);
    if (!event || !triggers?.length) return;

    Promise.all(
        triggers.map(async (trigger: Trigger) => {
            const valid = await event.test(actor, trigger.conditions, options);
            if (!valid) return;

            for (let i = 0; i < trigger.actions.length; i++) {
                const triggerAction = trigger.actions[i];
                const action = ACTIONS_MAP.get(triggerAction.type);
                if (!action) continue;

                const method = event[action.type] as (
                    actor: ActorPF2e,
                    action: (typeof triggerAction)["options"],
                    linkOption: TriggerInputValueType,
                    options?: Record<string, any>
                ) => Promisable<boolean>;

                const nextAction = trigger.actions.at(i + 1);
                const fn = () =>
                    method(actor, triggerAction.options, nextAction?.linkOption, options);

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

function createTrigger<TType extends TriggerEventType>(type: TType): Trigger | undefined {
    const event = EVENTS_MAP.get(type);
    if (!event) return;

    const usedConditions = {} as Record<string, boolean>;
    const conditions = R.pipe(
        event.conditions as Readonly<TriggerInputEntry[]>,
        R.map((condition) => {
            const name = condition.name;
            const value = defaultInputValue(condition);

            usedConditions[name] = !!condition.required;
            return [name, value] as const;
        }),
        R.fromEntries()
    );

    return {
        event: type,
        conditions,
        actions: [],
        usedConditions,
    };
}

function defaultInputValue(input: TriggerInputEntry): TriggerInputValueType {
    return input.required ? input.default ?? TRIGGER_INPUT_DEFAULT_VALUES[input.type] : undefined;
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
        ? TInput extends { options: infer TOptions extends string[] }
            ? TOptions[number]
            : never
        : TriggerInputValueTypes[TType]
    : never;

type TriggerInputValueTypes = typeof TRIGGER_INPUT_DEFAULT_VALUES;

type TriggerInputValueType = TriggerInputValueTypes[keyof TriggerInputValueTypes] | undefined;

type Triggers = TriggerEvents extends { id: infer TEventId extends TriggerEventType }
    ? {
          [k in TEventId]: Extract<TriggerEvents, { id: k }> extends {
              conditions: infer TConditions extends Readonly<TriggerInputEntry[]>;
          }
              ? {
                    event: k;
                    conditions: ExtractTriggerInputs<TConditions>;
                    actions: TriggerAction[];
                    usedConditions: { [c in keyof ExtractTriggerInputs<TConditions>]: boolean };
                }
              : never;
      }
    : never;

type TriggerEvents = InstanceType<(typeof EVENTS)[number]>;

type TriggerEventType = TriggerEvents["id"];

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
    options: (string | { value: string; label: string })[];
    localize?: true;
};

type TriggerInputType = "number" | "text" | "uuid" | "checkbox" | "select";

export type {
    ExtractTriggerInputs,
    Trigger,
    TriggerEventType,
    TriggerInputEntry,
    TriggerInputType,
    TriggerInputValueType,
    Triggers,
};

export {
    EVENTS_MAP,
    EVENT_TRIGGERS,
    createTrigger,
    defaultInputValue,
    isInputType,
    prepareTriggers,
    runTrigger,
};
