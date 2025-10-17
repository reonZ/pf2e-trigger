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

    #getTargetDocument(combatant?: CombatantPF2e): TargetDocuments | undefined {
        if (!combatant) return;

        const actor = combatant.actor;
        return this.isValidEvent(actor) ? { actor, token: combatant.token } : undefined;
    }

    #onTurnStart(combatant?: CombatantPF2e) {
        const target = this.#getTargetDocument(combatant);

        if (target) {
            this.executeTriggers({ this: target }, "turn-start");
        }
    }

    #onTurnEnd(combatant?: CombatantPF2e) {
        const target = this.#getTargetDocument(combatant);

        if (target) {
            this.executeTriggers({ this: target }, "turn-end");
        }
    }
}

export { TurnHook };
