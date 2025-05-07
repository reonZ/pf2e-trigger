import { TriggerDurationEntry } from "trigger";
import { TriggerNode } from "trigger";
import { NodeSchemaOf } from "schema";
import { EffectExpiryType, TimeUnit } from "module-helpers";

class DurationUnitTriggerNode extends TriggerNode<NodeSchemaOf<"value", "duration-unit">> {
    async query(): Promise<TriggerDurationEntry> {
        const origin = await this.get("origin");
        const data: TriggerDurationEntry = {
            expiry: (await this.get("expiry")) as EffectExpiryType,
            unit: (await this.get("unit")) as TimeUnit,
            value: await this.get("value"),
        };

        if (origin) {
            data.context = {
                origin: {
                    actor: origin.actor.uuid,
                    token: origin.token?.uuid ?? null,
                    item: null,
                    spellcasting: null,
                },
                roll: null,
                target: null,
            };
        }

        return data;
    }
}

export { DurationUnitTriggerNode };
