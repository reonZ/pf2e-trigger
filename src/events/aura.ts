import { createEventEntry } from ".";
import { insideAuraCondition } from "../conditions/inside-aura";

function createAuraEvent(key: string, icon: string) {
    return createEventEntry(key, icon, {
        conditions: [insideAuraCondition(key)],
    });
}

function enterAuraEvent() {
    return createAuraEvent("aura-enter", "fa-solid fa-circle");
}

function leaveAuraEvent() {
    return createAuraEvent("aura-leave", "fa-regular fa-circle");
}

export { enterAuraEvent, leaveAuraEvent };
