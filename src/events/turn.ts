import { CombatantPF2e, EncounterPF2e, createHook } from "module-helpers";
import { createEventEntry } from ".";
import { runTriggers } from "../trigger";

function createTurnEvent(key: string, icon: string, hook: string) {
    const _hook = createHook(
        hook,
        (combatant: CombatantPF2e, encounter: EncounterPF2e, userId: string) => {
            const actor = combatant.actor;
            if (!actor) return;

            runTriggers(key, { actor });
        }
    );

    return createEventEntry(key, icon, { _enable: _hook.activate, _disable: _hook.disable });
}

function turnEndEvent() {
    return createTurnEvent("turn-start", "fa-solid fa-hourglass-start", "pf2e.startTurn");
}

function turnStartEvent() {
    return createTurnEvent("turn-end", "fa-solid fa-hourglass-end", "pf2e.endTurn");
}

export { turnEndEvent, turnStartEvent };
