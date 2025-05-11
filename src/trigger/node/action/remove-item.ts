import { findItemWithSourceId } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RemoveItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "remove-item">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (actor) {
            const uuid = await this.get("uuid");
            const exist = findItemWithSourceId(actor, uuid);

            await exist?.delete();
        }

        return this.send("out");
    }
}

export { RemoveItemTriggerNode };
