import { findItemWithSourceId } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RemoveItemSourceTriggerNode extends TriggerNode<
    NodeSchemaOf<"action", "remove-item-source">
> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const exist = findItemWithSourceId(actor, uuid);

        await exist?.delete();
        return this.send("out");
    }
}

export { RemoveItemSourceTriggerNode };
