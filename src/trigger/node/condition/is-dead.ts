import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class IsDeadTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "is-dead">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");
        return this.send(!!actor?.isDead);
    }
}

export { IsDeadTriggerNode };
