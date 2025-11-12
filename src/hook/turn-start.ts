import { TriggerHook } from "hook";
import { CombatantPF2e } from "module-helpers";

class TurnStartHook extends TriggerHook {
    #turnStartHook = this.createEventHook("pf2e.startTurn", this.#onTurnStart.bind(this));

    get events(): ["turn-start"] {
        return ["turn-start"];
    }

    activate(): void {
        this.#turnStartHook.activate();
    }

    disable(): void {
        this.#turnStartHook.disable();
    }

    #onTurnStart(combatant: CombatantPF2e) {
        const actor = combatant.actor;
        const target = this.isValidEventActor(actor)
            ? { actor, token: combatant.token }
            : undefined;

        if (target) {
            this.executeTriggers({ this: target });
        }
    }
}

export { TurnStartHook };
