import { getActorMaster } from "module-helpers/src";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GetMasterTriggerNode extends TriggerNode<NodeSchemaOf<"action", "get-master">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");
        const master = getActorMaster(actor);

        if (master) {
            this.setVariable("master", { actor: master });
        }

        return this.send("out");
    }
}

export { GetMasterTriggerNode };
