import { unitDurationSchema } from "schema/value/schema-value-duration-unit";
import { TriggerNode } from "../trigger-node";
import { DurationData, EffectExpiryType, TimeUnit } from "module-helpers";

class UnitDurationTriggerValue extends TriggerNode<typeof unitDurationSchema> {
    #cached: DurationData | undefined;

    async query(key: "duration"): Promise<TriggerDurationData> {
        this.#cached ??= {
            expiry: (await this.get("expiry")) as EffectExpiryType,
            unit: (await this.get("unit")) as TimeUnit,
            value: await this.get("value"),
        };

        const origin = await this.get("origin");
        const context = origin
            ? {
                  origin: {
                      actor: origin.actor!.uuid,
                      token: origin.token?.uuid ?? null,
                      item: null,
                      spellcasting: null,
                  },
                  roll: null,
                  target: null,
              }
            : undefined;

        return {
            ...this.#cached,
            context,
        };
    }
}

export { UnitDurationTriggerValue };
