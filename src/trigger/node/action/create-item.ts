import {
    ActorPF2e,
    getItemFromUuid,
    getItemSource,
    getItemSourceId,
    ItemPF2e,
    ItemType,
} from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class CreateItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "create-item">> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const actor = await this.getTargetActor("target");
        const item = await getItemFromUuid(uuid);

        if (!item || !actor) {
            return this.send("out");
        }

        const duplicates = !!(await this.get("duplicate"));
        const maxTakable = !duplicates ? 1 : item.isOfType("feat") ? item.maxTakable : Infinity;

        if (maxTakable !== Infinity) {
            const uuid = getItemSourceId(item);
            const exist: ItemPF2e<ActorPF2e>[] = [];
            const items = actor.itemTypes[item.type as ItemType];

            for (const found of items) {
                if (found.sourceId !== uuid) continue;
                exist.push(found);
            }

            if (exist.length >= maxTakable) {
                return this.send("out");
            }
        }

        const source = getItemSource(item);
        const [created] = await actor.createEmbeddedDocuments("Item", [source]);

        this.setVariable("item", created);

        return this.send("out");
    }
}

export { CreateItemTriggerNode };
