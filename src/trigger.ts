import { getSetting, R } from "foundry-pf2e";
import { ACTIONS, TRIGGER_ACTIONS, TriggerActions } from "./action";
import { AuraEnterTriggerEvent, AuraLeaveTriggerEvent } from "./events/aura";
import { TriggerEvent } from "./events/base";

const EVENTS = [AuraEnterTriggerEvent, AuraLeaveTriggerEvent] as const;

const EVENTS_MAP = new Map(
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

    const allTriggers = getSetting<Trigger[]>("customTriggers");

    for (const event of EVENTS_MAP.values()) {
        const eventId = event.id;

        if (!EVENT_TRIGGERS.has(eventId)) {
            // TODO need to validate
            const eventTriggers = allTriggers.filter((trigger) => trigger.event === eventId);

            EVENT_TRIGGERS.set(eventId, eventTriggers);

            event._enable(eventTriggers.length > 0);
        }
    }

    // TODO remove that shit
    // @ts-ignore
    window.trigger = {
        triggers: EVENT_TRIGGERS,
        events: EVENTS,
    };
}

async function runTrigger<
    TEventId extends TriggerEventType,
    TEvent extends TriggerEvent = Extract<TriggerEvents, { id: TEventId }>
>(eventId: TEventId, actor: ActorPF2e, options: EventOptions<TEventId>) {
    const event = EVENTS_MAP.get(eventId) as unknown as TEvent;
    const triggers = EVENT_TRIGGERS.get(eventId);
    if (!event || !triggers?.length) return;

    Promise.all(
        triggers.map(async (trigger) => {
            const valid = await event.test(actor, trigger, options);
            if (!valid) return;

            // TODO we must loop over chains instead of the whole array
            for (const action of TRIGGER_ACTIONS) {
                const triggerAction = trigger.actions[action];
                if (!triggerAction) continue;

                const method = event[action] as (
                    actor: ActorPF2e,
                    trigger: TriggerActions[keyof TriggerActions],
                    options?: any
                ) => Promisable<boolean>;

                const canContinue = await method(actor, triggerAction, options);
                // if (!canContinue) break;
            }
        })
    );
}

function createTrigger(type: TriggerEventType): Trigger | undefined {
    const event = EVENTS_MAP.get(type);
    if (!event) return;

    type NewTriggerCondition = Triggers[typeof type]["conditions"];
    type NewTriggerConditionName = keyof NewTriggerCondition;

    const usedConditions = {} as Record<NewTriggerConditionName, boolean>;

    const inputValue = (input: TriggerInputEntry) => {
        return input.required ? (input.type === "toggle" ? false : "") : undefined;
    };

    const conditions = R.pipe(
        event.conditions as Readonly<TriggerInputEntry[]>,
        R.map((condition) => {
            const name = condition.name as NewTriggerConditionName;
            const value = inputValue(condition);

            usedConditions[name] = !!condition.required;

            return [name, value] as const;
        }),
        R.fromEntries()
    ) as NewTriggerCondition;

    return {
        event: type,
        conditions,
        usedConditions,
        actions: {},
    };
}

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

type TriggerInputValueTypes = {
    text: string;
    uuid: string;
    toggle: boolean;
    select: string;
};

type TriggerInputValueType = TriggerInputValueTypes[keyof TriggerInputValueTypes];

type EventOptions<TEventID extends TriggerEventType> = Parameters<
    ExtractTriggerEvent<TEventID>["test"]
>[2] &
    Parameters<ExtractTriggerEvent<TEventID>["rollDamage"]>[2];

type Trigger = Triggers[keyof Triggers];

type Triggers = TriggerEvents extends { id: infer TEventId extends TriggerEventType }
    ? {
          [k in TEventId]: Extract<TriggerEvents, { id: k }> extends {
              conditions: infer TConditions extends Readonly<TriggerInputEntry[]>;
          }
              ? {
                    event: k;
                    conditions: ExtractTriggerInputs<TConditions>;
                    actions: Partial<TriggerActions>;
                    usedConditions: { [c in keyof ExtractTriggerInputs<TConditions>]: boolean };
                }
              : never;
      }
    : never;

type TriggerEvents = InstanceType<(typeof EVENTS)[number]>;

type ExtractTriggerEvent<TEventId extends TriggerEventType> = Extract<
    TriggerEvents,
    { id: TEventId }
>;

type TriggerEventType = TriggerEvents["id"];

type TriggerInputEntry =
    | TriggerInputText
    | TriggerInputUuid
    | TriggerInputToggle
    | TriggerInputSelect;

type TriggerInputEntryBase<TType extends string> = {
    name: string;
    type: TType;
    required?: boolean;
};

type TriggerInputText = TriggerInputEntryBase<"text">;

type TriggerInputUuid = TriggerInputEntryBase<"uuid">;

type TriggerInputToggle = TriggerInputEntryBase<"toggle"> & {
    default?: boolean;
};

type TriggerInputSelect = TriggerInputEntryBase<"select"> & {
    options: string[];
};

type TriggerInputType = TriggerInputEntry["type"];

export { EVENT_TRIGGERS, EVENTS_MAP, createTrigger, prepareTriggers, runTrigger };
export type {
    ExtractTriggerInputs,
    ExtractTriggerInputValue,
    Trigger,
    TriggerEvents,
    TriggerEventType,
    TriggerInputEntry,
    TriggerInputType,
    TriggerInputValueType,
    Triggers,
};
