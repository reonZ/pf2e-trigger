import { NodeEventKey } from "@schema/schema-list";
import { TriggerHook } from "./trigger-hook";
import { CombatantPF2e, EncounterPF2e, Hook, createHook } from "module-helpers";

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
        const actor = combatant.actor;
        if (!actor) return;

        this._executeTriggers({ target: { actor, token: combatant.token } });
    }
}

class StartTurnHook extends TurnHook {
    constructor() {
        super("pf2e.startTurn");
    }

    get events(): NodeEventKey[] {
        return ["turn-start"];
    }
}

class EndTurnHook extends TurnHook {
    constructor() {
        super("pf2e.endTurn");
    }

    get events(): NodeEventKey[] {
        return ["turn-end"];
    }
}

export { StartTurnHook, EndTurnHook };
