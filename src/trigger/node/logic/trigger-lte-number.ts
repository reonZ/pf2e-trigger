import { NumberLogicTriggerNode } from "./trigger-number-logic";

class LteNumberTriggerNode extends NumberLogicTriggerNode {
    protected _logic(value: number, input: number): boolean {
        return value <= input;
    }
}

export { LteNumberTriggerNode };
