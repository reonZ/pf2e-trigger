import { TriggerHook } from "hook";
import { CombatantPF2e } from "module-helpers";

class TurnEndHook extends TriggerHook {
    #turnEndHook = this.createEventHook("pf2e.endTurn", this.#onTurnEnd.bind(this));

    get events(): ["turn-end"] {
        return ["turn-end"];
    }

    activate(): void {
        this.#turnEndHook.activate();
    }

    disable(): void {
        this.#turnEndHook.disable();
    }

    #onTurnEnd(combatant: CombatantPF2e) {
        const actor = combatant.actor;
        const target = this.isValidEventActor(actor)
            ? { actor, token: combatant.token }
            : undefined;

        if (target) {
            this.executeTriggers({ this: target });
        }
    }
}

export { TurnEndHook };
