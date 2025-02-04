import { NumberTriggerLogic } from "./trigger-logic-number";

class GtNumberTriggerLogic extends NumberTriggerLogic {
    executeLogic(a: number, b: number): boolean {
        return a > b;
    }
}

export { GtNumberTriggerLogic };
