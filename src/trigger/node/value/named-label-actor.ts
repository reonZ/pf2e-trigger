import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class NamedLabelActorTriggerNode extends TriggerNode<NodeSchemaOf<"value", "named-label-actor">> {
    async query(): Promise<string> {
        const prefix = await this.get("prefix");
        const actor = await this.getTargetActor("target");

        return actor ? `${prefix} (${actor.name})` : prefix;
    }
}

export { NamedLabelActorTriggerNode };
