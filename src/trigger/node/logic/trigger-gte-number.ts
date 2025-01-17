import { NumberLogicTriggerNode } from "./trigger-number-logic";

class GteNumberTriggerNode extends NumberLogicTriggerNode {
    protected _logic(value: number, input: number): boolean {
        return value >= input;
    }
}

export { GteNumberTriggerNode };
