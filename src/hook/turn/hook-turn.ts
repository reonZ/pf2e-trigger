import { TriggerHook } from "hook/hook";
import { CombatantPF2e, EncounterPF2e, Hook, createHook, userIsActiveGM } from "module-helpers";

abstract class TurnHook extends TriggerHook {
    #hook: Hook;

    constructor(event: "pf2e.startTurn" | "pf2e.endTurn") {
        super();
        this.#hook = createHook(event, this.#onHook.bind(this));
    }

    protected _activate(): void {
        this.#hook.activate();
    }

    protected _disable(): void {
        this.#hook.disable();
    }

    #onHook(combatant: CombatantPF2e, encounter: EncounterPF2e, userId: string) {
        if (!userIsActiveGM()) return;

        const actor = combatant.actor;
        if (!actor) return;

        this.executeTriggers({ this: { actor, token: combatant.token } });
    }
}

export { TurnHook };
