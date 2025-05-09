import { NodeSchemaOf } from "schema";
import { getTemporaryIdentifier, TriggerNode } from "trigger";

class RemoveTemporaryTriggerNode extends TriggerNode<NodeSchemaOf<"action", "remove-temporary">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const triggerId = await this.get("trigger");
        const { slug } = await getTemporaryIdentifier(this as any, triggerId);
        const exist = actor.itemTypes.effect.find((item) => item.slug === slug);

        await exist?.delete();
        return this.send("out");
    }
}

export { RemoveTemporaryTriggerNode };
