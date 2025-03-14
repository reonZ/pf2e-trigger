import { ActorUpdateOperation, TokenDocumentPF2e } from "module-helpers";
import { ActorHook } from "./hook-actor";

class DamageActorHook extends ActorHook {
    constructor() {
        super("updateActor");
    }

    get events(): ["damage-received", "heal-received"] {
        return ["damage-received", "heal-received"];
    }

    async _onHook(
        options: PreTriggerExecuteOptions,
        data: object,
        operation: ActorUpdateOperation<TokenDocumentPF2e>
    ): Promise<"damage-received" | "heal-received" | false> {
        if (!operation.damageTaken) return false;

        options.variables ??= {};
        options.variables.value = Math.abs(operation.damageTaken);

        return operation.damageTaken < 0 ? "heal-received" : "damage-received";
    }
}

export { DamageActorHook };
