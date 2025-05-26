import { ActorPF2e, ItemPF2e, splitListString } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode, TriggerRollEntry } from "trigger";

class RollDataTriggerNode extends TriggerNode<NodeSchemaOf<"value", "roll-data">> {
    async query(): Promise<TriggerRollEntry> {
        return {
            item: (await this.get("item")) as ItemPF2e<ActorPF2e>,
            options: splitListString(await this.get("options")),
            origin: await this.get("origin"),
            traits: splitListString(await this.get("traits")),
        };
    }
}

export { RollDataTriggerNode };
