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
    conditions?: TriggerConditionEntry[];
    actions?: TriggerActionEntry[];
    _enable?: () => Promisable<void>;
    _disable?: () => Promisable<void>;
};

type TriggerEventEntry = WithRequired<TriggerEventEntryOptions, "conditions" | "actions"> & {
    key: string;
    icon: string;
};

export { createEventEntry, getEventEntries, getEventEntry, getEventLabel, initializeEvents };
export type { TriggerEventEntry };
