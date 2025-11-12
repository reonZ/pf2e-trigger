import { SimpleEventHook } from "hook";
import { CombatantPF2e } from "module-helpers";

class CombatantHook extends SimpleEventHook {
    _onEvent(combatant: CombatantPF2e): void {
        const actor = combatant.actor;

        if (this.isValidEventActor(actor)) {
            this.executeTriggers({ this: { actor, token: combatant.token } });
        }
    }
}

export { CombatantHook };
