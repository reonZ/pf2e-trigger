import { durationSingleSchema, durationUnitSchema } from "schema/value/schema-duration.data";
import { TriggerNode } from "../trigger-node";
import { ExtractSchemaOuputsKeys } from "schema/schema";
import { DurationData, EffectExpiryType, TimeUnit } from "module-helpers";

class DurationUnlimitedTriggerNode extends TriggerNode<typeof durationSingleSchema> {
    protected async _query(
        key: ExtractSchemaOuputsKeys<typeof durationSingleSchema>
    ): Promise<DurationData> {
        return {
            expiry: null,
            unit: "unlimited",
            value: -1,
        };
    }
}

class DurationEncounterTriggerNode extends TriggerNode<typeof durationSingleSchema> {
    protected async _query(
        key: ExtractSchemaOuputsKeys<typeof durationSingleSchema>
    ): Promise<DurationData> {
        return {
            expiry: null,
            unit: "encounter",
            value: -1,
        };
    }
}

class DurationUnitTriggerNode extends TriggerNode<typeof durationUnitSchema> {
    protected async _query(
        key: ExtractSchemaOuputsKeys<typeof durationUnitSchema>
    ): Promise<DurationData> {
        return {
            expiry: (await this.get("expiry")) as EffectExpiryType,
            unit: (await this.get("unit")) as TimeUnit,
            value: await this.get("value"),
        };
    }
}

export { DurationEncounterTriggerNode, DurationUnitTriggerNode, DurationUnlimitedTriggerNode };
