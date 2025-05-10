import { NodeSchemaOf } from "schema";
import { TriggerEffectEntry, TriggerNode } from "trigger";

class EffectDataTriggerNode extends TriggerNode<NodeSchemaOf<"value", "effect-data">> {
    async query(): Promise<TriggerEffectEntry> {
        return {
            name: await this.get("label"),
            duration: await this.get("duration"),
            unidentified: await this.get("unidentified"),
            img: (await this.get("image")) as ImageFilePath,
        };
    }
}

export { EffectDataTriggerNode };
