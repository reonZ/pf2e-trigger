import { TriggerHook } from "hook";
import { CombatantPF2e } from "module-helpers";

class TurnHook extends TriggerHook {
    #turnStartHook = this.createEventHook("pf2e.startTurn", this.#onTurnStart.bind(this));
    #turnEndHook = this.createEventHook("pf2e.endTurn", this.#onTurnEnd.bind(this));

    get events(): ["turn-start", "turn-end"] {
        return ["turn-start", "turn-end"];
    }

    activate(): void {
        this.#turnStartHook.toggle("turn-start");
        this.#turnEndHook.toggle("turn-end");
    }

    disable(): void {
        this.#turnStartHook.disable();
        this.#turnEndHook.disable();
    }

    #onTurnStart(combatant: CombatantPF2e) {
        const actor = combatant.actor;

        if (this.isValidEvent(actor)) {
            this.executeTriggers({ this: { actor, token: combatant.token } }, "turn-start");
        }
    }

    #onTurnEnd(combatant: CombatantPF2e) {
        const actor = combatant.actor;

        if (this.isValidEvent(actor)) {
            this.executeTriggers({ this: { actor, token: combatant.token } }, "turn-end");
        }
    }
}

export { TurnHook };
