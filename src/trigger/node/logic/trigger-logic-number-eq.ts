import { NumberTriggerLogic } from "./trigger-logic-number";

class EqNumberTriggerLogic extends NumberTriggerLogic {
    executeLogic(a: number, b: number): boolean {
        return a === b;
    }
}

export { EqNumberTriggerLogic };
