import { R } from "module-helpers";
import { LogicSchema } from "schema/logic/schema-logic";
import { TriggerNode } from "../trigger-node";

abstract class NumberLogicTriggerNode extends TriggerNode<LogicSchema<"number">> {
    protected abstract _logic(value: number, input: number): boolean;

    protected async _execute(target: TargetDocuments, value?: number) {
        const input = await this.get("b");
        if (!R.isNumber(value) || !R.isNumber(input)) return;

        const sendKey = this._logic(value, input) ? "true" : "false";
        return this.send(sendKey, target);
    }
}

export { NumberLogicTriggerNode };
