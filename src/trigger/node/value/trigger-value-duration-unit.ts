import { unitDurationSchema } from "schema/value/schema-value-duration-unit";
import { TriggerNode } from "../trigger-node";
import { DurationData, EffectExpiryType, TimeUnit } from "module-helpers";

class UnitDurationTriggerValue extends TriggerNode<typeof unitDurationSchema> {
    #cached: DurationData | undefined;

    async query(key: "duration"): Promise<DurationData> {
        return (this.#cached ??= {
            expiry: (await this.get("expiry")) as EffectExpiryType,
            unit: (await this.get("unit")) as TimeUnit,
            value: (await this.get("value")) ?? 0,
        });
    }
}

export { UnitDurationTriggerValue };
