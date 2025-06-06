import { hasRollOption } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { getTemporaryIdentifier, TriggerNode } from "trigger";

class HasTemporaryTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "has-temporary">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("false");
        }

        const triggerId = await this.get("trigger");
        const { slug } = await getTemporaryIdentifier(this as any, triggerId);
        const sendKey = hasRollOption(actor, `self:effect:${slug}`);

        return this.send(sendKey);
    }
}

export { HasTemporaryTriggerNode };
