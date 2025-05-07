import { TriggerDurationEntry } from "trigger";
import { TriggerNode } from "trigger";
import { NodeSchemaOf } from "schema";

class DurationSimpleTriggerNode extends TriggerNode<NodeSchemaOf<"value", "duration-simple">> {
    async query(): Promise<TriggerDurationEntry> {
        return {
            expiry: null,
            unit: (await this.get("unit")) as "unlimited" | "encounter",
            value: -1,
        };
    }
}

export { DurationSimpleTriggerNode };
