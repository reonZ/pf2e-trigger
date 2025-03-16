import { TriggerHook } from "hook/hook";
import { CombatantPF2e } from "module-helpers";

class TurnHook extends TriggerHook<"turn-start" | "turn-end"> {
    #turnStartHook = this.createEventHook("pf2e.startTurn", this.#onTurnStart.bind(this));
    #turnEndHook = this.createEventHook("pf2e.endTurn", this.#onTurnEnd.bind(this));

    get events(): ["turn-start", "turn-end"] {
        return ["turn-start", "turn-end"];
    }

    protected _activate(): void {
        this.#turnStartHook.toggle("turn-start");
        this.#turnEndHook.toggle("turn-end");
    }

    protected _disable(): void {
        this.#turnStartHook.disable();
        this.#turnEndHook.disable();
    }

    #onTurnStart(combatant: CombatantPF2e) {
        const actor = combatant.actor;
        if (!this.isValidHookEvent(actor)) return;

        this.executeEventTriggers("turn-start", {
            this: { actor, token: combatant.token },
        });
    }

    #onTurnEnd(combatant: CombatantPF2e) {
        const actor = combatant.actor;
        if (!this.isValidHookEvent(actor)) return;

        this.executeEventTriggers("turn-end", {
            this: { actor, token: combatant.token },
        });
    }
}

export { TurnHook };
