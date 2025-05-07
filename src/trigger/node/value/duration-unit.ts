import { TriggerDurationEntry } from "trigger";
import { TriggerNode } from "trigger";
import { NodeSchemaOf } from "schema";
import { EffectExpiryType, TimeUnit } from "module-helpers";

class DurationUnitTriggerNode extends TriggerNode<NodeSchemaOf<"value", "duration-unit">> {
    async query(): Promise<TriggerDurationEntry> {
        return {
            expiry: (await this.get("expiry")) as EffectExpiryType,
            unit: (await this.get("unit")) as TimeUnit,
            value: await this.get("value"),
            origin: await this.get("origin"),
        };
    }
}

export { DurationUnitTriggerNode };
