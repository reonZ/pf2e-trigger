import { PersistentEventHook, TriggerHook } from "hook";
import { CombatantPF2e } from "module-helpers";
import { NodeEventKey } from "schema";

class CombatantHook extends TriggerHook {
    #combatantEventHook: PersistentEventHook<NodeEventKey>;
    #constructorName: string;
    #eventKey: NodeEventKey;

    constructor(eventName: string, eventKey: NodeEventKey, constructorName: string) {
        super();

        this.#combatantEventHook ??= this.createEventHook(
            eventName,
            this.#onCombatantEvent.bind(this)
        );

        this.#constructorName = constructorName;

        this.#eventKey = eventKey;
    }

    get constructorName(): string {
        return this.#constructorName;
    }

    get eventKeys(): NodeEventKey[] {
        return [this.#eventKey];
    }

    activate(): void {
        this.#combatantEventHook.activate();
    }

    disable(): void {
        this.#combatantEventHook.disable();
    }

    #onCombatantEvent(combatant: CombatantPF2e) {
        const actor = combatant.actor;

        if (this.isValidEventActor(actor)) {
            this.executeTriggers({ this: { actor, token: combatant.token } });
        }
    }
}

export { CombatantHook };
