import { NumberLogicTriggerNode } from "./trigger-number-logic";

class GtNumberTriggerNode extends NumberLogicTriggerNode {
    protected _logic(value: number, input: number): boolean {
        return value > input;
    }
}

export { GtNumberTriggerNode };