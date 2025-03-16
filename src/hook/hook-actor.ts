import { TriggerHook } from "hook/hook";
import {
    ActorPF2e,
    ActorSourcePF2e,
    ActorUpdateOperation,
    TokenDocumentPF2e,
} from "module-helpers";

class ActorHook extends TriggerHook<"damage-received" | "heal-received"> {
    #updateActorHook = this.createEventHook("updateActor", this.#onUpdateActor.bind(this));

    get events(): ["damage-received", "heal-received"] {
        return ["damage-received", "heal-received"];
    }

    protected _activate(): void {
        this.#updateActorHook.activate();
    }

    protected _disable(): void {
        this.#updateActorHook.disable();
    }

    #onUpdateActor(
        actor: ActorPF2e,
        data: DeepPartial<ActorSourcePF2e>,
        operation: ActorUpdateOperation<TokenDocumentPF2e>
    ) {
        const options = this.createHookOptions(actor);
        if (!options) return;

        if (operation.damageTaken) {
            options.variables.value = Math.abs(operation.damageTaken);
            const event = operation.damageTaken < 0 ? "heal-received" : "damage-received";
            this.executeEventTriggers(event, options);
        }
    }
}

export { ActorHook };
