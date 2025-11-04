import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GetResourceTriggerNode extends TriggerNode<NodeSchemaOf<"action", "get-resource">> {
    async execute(): Promise<boolean> {
        const slug = await this.get("slug");
        const actor = await this.getTargetActor("target");
        const resource = actor?.getResource(slug);

        this.setVariable("label", resource?.label ?? "");
        this.setVariable("value", resource?.value ?? -1);
        this.setVariable("max", resource?.max ?? -1);

        return this.send("out");
    }
}

export { GetResourceTriggerNode };
