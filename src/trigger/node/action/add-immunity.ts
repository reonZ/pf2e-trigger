import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class AddImmunityTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-immunity">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        // TODO

        return this.send("out");
    }
}

export { AddImmunityTriggerNode };
