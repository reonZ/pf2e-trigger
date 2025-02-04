import { NumberTriggerLogic } from "./trigger-logic-number";

class LteNumberTriggerLogic extends NumberTriggerLogic {
    executeLogic(a: number, b: number): boolean {
        return a <= b;
    }
}

export { LteNumberTriggerLogic };
