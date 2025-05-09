import { NodeSchemaInput } from "schema";
import { TriggerDurationEntry, TriggerNode } from "trigger";

async function getEffectData(node: TriggerNode<EffectDataSchema>): Promise<NodeEffectData> {
    const duration = await node.get("duration");
    const unidentified = await node.get("unidentified");

    const origin = duration.origin;
    delete duration.origin;

    return {
        duration,
        unidentified,
        origin,
    };
}

type NodeEffectData = {
    duration: TriggerDurationEntry;
    unidentified: boolean;
    origin: TargetDocuments | undefined;
};

type EffectDataSchema = {
    inputs: Array<
        | { key: "duration"; type: "duration" }
        | { key: "unidentified"; type: "boolean" }
        | NodeSchemaInput
    >;
};

export { getEffectData };
