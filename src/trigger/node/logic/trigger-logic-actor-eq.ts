import { TriggerNode } from "../trigger-node";

class EqActorTriggerLogic extends TriggerNode<LogicSchema<"target">> {
    async execute(): Promise<void> {
        const a = await this.get("a");
        const b = await this.get("b");

        const sendKey = a && b && a.actor.uuid === b.actor.uuid ? "true" : "false";
        return this.send(sendKey);
    }
}

export { EqActorTriggerLogic };
