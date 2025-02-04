import { NumberTriggerLogic } from "./trigger-logic-number";

class LtNumberTriggerLogic extends NumberTriggerLogic {
    executeLogic(a: number, b: number): boolean {
        return a < b;
    }
}

export { LtNumberTriggerLogic };
