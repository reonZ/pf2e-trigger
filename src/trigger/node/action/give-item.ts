import { giveItemToActor } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GiveItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "give-item">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");
        const actor = await this.getTargetActor("target");

        if (item?.isOfType("physical") && actor) {
            const quantity = await this.get("quantity");
            await giveItemToActor(item, actor, quantity);
        }

        return this.send("out");
    }
}

export { GiveItemTriggerNode };
