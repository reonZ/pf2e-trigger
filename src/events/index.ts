import { R, localize } from "module-helpers";
import { TriggerActionEntry } from "../actions";
import { TriggerConditionEntry } from "../conditions";
import { Trigger } from "../trigger";
import { enterAuraEvent, leaveAuraEvent } from "./aura";
import { turnEndEvent, turnStartEvent } from "./turn";

const EVENTS: Map<string, TriggerEventEntry> = new Map();

function initializeEvents() {
    const eventEntries = [enterAuraEvent(), leaveAuraEvent(), turnStartEvent(), turnEndEvent()];

    for (const eventEntry of eventEntries) {
        EVENTS.set(eventEntry.key, eventEntry);
    }
}

function getEventEntry(key: string) {
    return EVENTS.get(key);
}

function getEventEntries() {
    return [...EVENTS.values()];
}

function createEventEntry(
    key: string,
    icon: string,
    options: TriggerEventEntryOptions = {}
): TriggerEventEntry {
    return {
        key,
        icon,
        ...options,
        conditions: options.conditions ?? [],
        actions: options.actions ?? [],
        hasSource: !!options.hasSource,
    };
}

function getEventLabel(eventEntry: TriggerEventEntry, trigger: Trigger) {
    return R.isFunction(eventEntry.label)
        ? eventEntry.label(trigger)
        : R.isString(eventEntry.label)
        ? game.i18n.localize(eventEntry.label)
        : localize("event", eventEntry.key, "label");
}

type TriggerEventEntryOptions = {
    group?: string;
    label?: string | ((trigger: Trigger) => string);
    hasSource?: boolean;
    conditions?: TriggerConditionEntry[];
    actions?: TriggerActionEntry[];
    _enable?: () => Promisable<void>;
    _disable?: () => Promisable<void>;
};

type TriggerEventEntry = WithRequired<
    TriggerEventEntryOptions,
    "hasSource" | "conditions" | "actions"
> & {
    key: string;
    icon: string;
};

export { createEventEntry, getEventEntries, getEventEntry, getEventLabel, initializeEvents };
export type { TriggerEventEntry };

// const EVENTS = [enterAuraEvent, leaveAuraEvent] as const;
// const EVENTS_MAP = new Map(EVENTS.map((event) => [event.key, event] as const));

// function getEvent<K extends TriggerEventType>(key: K) {
//     const event = EVENTS_MAP.get(key) as ITriggerEvent;
//     if (!event) return;

//     return {
//         key,
//         icon: event.icon,
//         hasSource: event.hasSource ?? false,
//         conditions: event.conditions ?? [],
//         actions: event.actions ?? [],
//         label: event.label,
//     } satisfies Required<Omit<ITriggerEvent, "label">> & {
//         label?: ITriggerEvent["label"];
//     } as unknown as ExtractTriggerEvent<K>;
// }

// function isEventType(type: string): type is TriggerEventType {
//     return EVENTS_MAP.has(type as TriggerEventType);
// }

// function getEvents() {
//     return foundry.utils.deepClone(EVENTS);
// }

// type ITriggerEvent = {
//     key: string;
//     icon: string;
//     label?: string | ((trigger: Trigger) => string);
//     hasSource?: boolean;
//     conditions?: ITriggerCondition[];
//     actions?: ITriggerAction[];
// };

// type TriggerEventEntry = (typeof EVENTS)[number];
// type TriggerEventType = TriggerEventEntry["key"];
// type TriggerEvent = ExtractTriggerEvents<TriggerEventEntry>;

// type ExtractTriggerEvents<TEvent extends TriggerEventEntry> = TEvent extends {
//     key: infer TKey extends TriggerEventType;
// }
//     ? { [k in TKey]: ExtractTriggerEvent<k> }[TKey]
//     : never;

// type ExtractTriggerEvent<K extends TriggerEventType> = Required<
//     Extract<TriggerEventEntry, { key: K }> &
//         Omit<ITriggerEvent, keyof Extract<TriggerEventEntry, { key: K }>>
// >;

// export { getEvent, getEvents, isEventType };
// export type { ITriggerEvent, TriggerEvent, TriggerEventType };
