import { getActorMaster } from "module-helpers/src";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class IsMasterTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "is-master">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");
        const master = (await this.get("master"))?.actor;
        const sendKey = actor && master && actor !== master && getActorMaster(actor) === master;

        return this.send(!!sendKey);
    }
}

export { IsMasterTriggerNode };
