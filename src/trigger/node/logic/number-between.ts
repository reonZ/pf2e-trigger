import { NodeSchemaOf } from "schema";
import { TriggerNode } from "../node";

class NumberBetweenTriggerNode extends TriggerNode<NodeSchemaOf<"logic", "number-between">> {
    async execute(): Promise<boolean> {
        const value = await this.get("value");
        const gte = await this.get("gte");
        const lt = await this.get("lt");

        const sendKey = value >= gte && value < (lt < 0 ? Infinity : lt);
        return this.send(sendKey);
    }
}

export { NumberBetweenTriggerNode };
