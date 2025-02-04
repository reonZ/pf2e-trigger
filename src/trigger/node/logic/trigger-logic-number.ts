import { TriggerNode } from "../trigger-node";

abstract class NumberTriggerLogic extends TriggerNode<LogicSchema<"number">> {
    abstract executeLogic(a: number, b: number): boolean;

    async execute(): Promise<void> {
        const a = (await this.get("a")) ?? 0;
        const b = (await this.get("b")) ?? 0;

        const sendKey = this.executeLogic(a, b) ? "true" : "false";
        return this.send(sendKey);
    }
}

export { NumberTriggerLogic };
