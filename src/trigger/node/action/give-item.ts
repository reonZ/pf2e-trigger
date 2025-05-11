import { getItemSource } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GiveItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "give-item">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");
        const actor = await this.getTargetActor("target");

        if (!actor || !item?.isOfType("physical") || actor.uuid === item.actor?.uuid) {
            return this.send("out");
        }

        if (item.actor) {
            await item.delete();
        }

        const source = getItemSource(item);
        await actor.createEmbeddedDocuments("Item", [source]);

        return this.send("out");
    }
}

export { GiveItemTriggerNode };
