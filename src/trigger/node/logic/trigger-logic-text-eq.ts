import { TriggerNode } from "../trigger-node";

class EqTextTriggerLogic extends TriggerNode<LogicSchema<"text">> {
    async execute(): Promise<void> {
        const a = (await this.get("a")) ?? "";
        const b = (await this.get("b")) ?? "";

        const sendKey = a === b ? "true" : "false";
        return this.send(sendKey);
    }
}

export { EqTextTriggerLogic };
