import { distanceBetween } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class InRangeTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "in-range">> {
    async execute(): Promise<boolean> {
        const a = (await this.get("a"))?.token?.object;
        const b = (await this.get("b"))?.token?.object;

        if (!a || !b) {
            return this.send("false");
        }

        const value = await this.get("distance");
        const distance = distanceBetween(a, b);

        return this.send(distance <= value);
    }
}

export { InRangeTriggerNode };
