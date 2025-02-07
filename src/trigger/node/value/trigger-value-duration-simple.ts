import { simpleDurationSchema } from "schema/value/schema-value-duration-simple";
import { TriggerNode } from "../trigger-node";
import { DurationData } from "module-helpers";
import { getUnilimitedDuration } from "helpers/helpers-duration";

class SimpleDurationTriggerValue extends TriggerNode<typeof simpleDurationSchema> {
    #cached: DurationData | undefined;

    async query(key: "duration"): Promise<TriggerDurationData> {
        this.#cached ??=
            (await this.get("unit")) === "encounter"
                ? { expiry: null, unit: "encounter", value: -1 }
                : getUnilimitedDuration();

        return this.#cached;
    }
}

export { SimpleDurationTriggerValue };
