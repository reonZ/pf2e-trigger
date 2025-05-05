import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

abstract class NumberLogicTriggerNode extends TriggerNode<NodeSchemaOf<"logic", "eq-number">> {
    abstract executeLogic(a: number, b: number): boolean;

    async execute(): Promise<boolean> {
        const a = await this.get("a");
        const b = await this.get("b");

        const sendKey = this.executeLogic(a, b);
        return this.send(sendKey);
    }
}

class EqNumberTriggerNode extends NumberLogicTriggerNode {
    executeLogic(a: number, b: number): boolean {
        return a === b;
    }
}

class GtNumberTriggerNode extends NumberLogicTriggerNode {
    executeLogic(a: number, b: number): boolean {
        return a > b;
    }
}

class GteNumberTriggerNode extends NumberLogicTriggerNode {
    executeLogic(a: number, b: number): boolean {
        return a >= b;
    }
}

class LtNumberTriggerNode extends NumberLogicTriggerNode {
    executeLogic(a: number, b: number): boolean {
        return a < b;
    }
}

class LteNumberTriggerNode extends NumberLogicTriggerNode {
    executeLogic(a: number, b: number): boolean {
        return a <= b;
    }
}

export {
    EqNumberTriggerNode,
    GteNumberTriggerNode,
    GtNumberTriggerNode,
    LteNumberTriggerNode,
    LtNumberTriggerNode,
};
