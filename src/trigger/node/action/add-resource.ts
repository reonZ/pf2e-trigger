import { CreaturePF2e } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AddResourceTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-resource">> {
    async execute(): Promise<boolean> {
        const slug = await this.get("slug");
        const actor = await this.getTargetActor("target");
        const resource = actor?.isOfType("creature") ? actor.getResource(slug) : null;

        if (!resource) {
            this.setVariable("value", -1);
            return this.send("out");
        }

        const amount = Math.abs(await this.get("amount"));
        const max = await this.get("max");
        const newValue = Math.min(resource.value + amount, max < 0 ? resource.max : max);

        await (actor as CreaturePF2e).updateResource(slug, newValue);

        const finalValue = (actor as CreaturePF2e).getResource(slug)?.value ?? newValue;
        this.setVariable("value", finalValue);

        return this.send("out");
    }
}

export { AddResourceTriggerNode };
