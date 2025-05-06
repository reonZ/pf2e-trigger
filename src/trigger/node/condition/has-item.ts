import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";
import { getItemWithSourceId } from "module-helpers";

class HasItemTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "has-item">> {
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

export { HasItemTriggerNode };
