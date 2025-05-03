import { NodeSchemaOf } from "schema";
import { TriggerNode } from "../node";
import { getItemWithSourceId } from "module-helpers";

class HasItemTriggerNode extends TriggerNode<HasItemSchema> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const target = await this.getTarget("target");

        if (!uuid || !target) {
            return this.send("false");
        }

        const item = getItemWithSourceId(target.actor, uuid);

        if (item) {
            this.setVariable("item", item);
            return this.send("true");
        } else {
            return this.send("false");
        }
    }
}

type HasItemSchema = NodeSchemaOf<"condition", "has-item">;

export { HasItemTriggerNode };
