import { ActorUpdateOperation, TokenDocumentPF2e } from "module-helpers";
import { ActorHook } from "./hook-actor";

class DamageActorHook extends ActorHook {
    constructor() {
        super("updateActor");
    }

    get events(): NodeEventKey[] {
        return ["damage-received"];
    }

    async _onHook(
        options: PreTriggerExecuteOptions,
        data: object,
        operation: ActorUpdateOperation<TokenDocumentPF2e>
    ) {
        if (!operation.damageTaken || operation.damageTaken < 0) return false;

        options.variables ??= {};
        options.variables.damage = operation.damageTaken;

        return true;
    }
}

export { DamageActorHook };
