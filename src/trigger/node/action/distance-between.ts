import { distanceBetween } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class DistanceBetweenTriggerNode extends TriggerNode<NodeSchemaOf<"action", "distance-between">> {
    async execute(): Promise<boolean> {
        const a = (await this.get("a"))?.token?.object;
        const b = (await this.get("b"))?.token?.object;

        if (!a || !b) {
            return this.send("out");
        }

        const distance = distanceBetween(a, b);
        this.setVariable("distance", distance);

        return this.send("out");
    }
}

export { DistanceBetweenTriggerNode };
