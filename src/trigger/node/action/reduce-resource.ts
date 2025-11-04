import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";
import { CreaturePF2e } from "module-helpers";

class ReduceResourceTriggerNode extends TriggerNode<NodeSchemaOf<"action", "reduce-resource">> {
    async execute(): Promise<boolean> {
        const slug = await this.get("slug");
        const actor = await this.getTargetActor("target");
        const resource = actor?.isOfType("creature") ? actor?.getResource(slug) : null;

        if (!resource) {
            this.setVariable("value", -1);
            return this.send("out");
        }

        const amount = Math.abs(await this.get("amount"));
        const min = Math.abs(await this.get("min"));
        const newValue = Math.max(resource.value - amount, Math.max(min, 0));

        await (actor as CreaturePF2e).updateResource(slug, newValue);

        const finalValue = (actor as CreaturePF2e).getResource(slug)?.value ?? newValue;
        this.setVariable("value", finalValue);

        return this.send("out");
    }
}

export { ReduceResourceTriggerNode };
