import { NodeSchemaOf } from "schema";
import { TriggerNode } from "../node";
import { hasRollOption } from "module-helpers";

class HasOptionTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "has-option">> {
    async execute(): Promise<boolean> {
        const option = await this.get("option");
        const actor = await this.getTargetActor("target");
        const sendKey = !!actor && !!option && hasRollOption(actor, option);

        return this.send(sendKey);
    }
}

export { HasOptionTriggerNode };
