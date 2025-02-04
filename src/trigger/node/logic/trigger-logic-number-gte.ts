import { NumberTriggerLogic } from "./trigger-logic-number";

class GteNumberTriggerLogic extends NumberTriggerLogic {
    executeLogic(a: number, b: number): boolean {
        return a >= b;
    }
}

export { GteNumberTriggerLogic };
