import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class EqActorTriggerNode extends TriggerNode<NodeSchemaOf<"logic", "eq-actor">> {
    async execute(): Promise<boolean> {
        const a = await this.get("a");
        const b = await this.get("b");

        return this.send(a?.actor.uuid === b?.actor.uuid);
    }
}

export { EqActorTriggerNode };
