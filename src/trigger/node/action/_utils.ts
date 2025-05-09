import { NodeSchemaInput } from "schema";
import { TriggerDurationEntry, TriggerNode } from "trigger";

async function getEffectData(node: EffectDataNode): Promise<NodeEffectData> {
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

async function getTemporaryIdentifier(
    node: TemporaryDataNode,
    triggerId?: string
): Promise<NodeTemporaryData> {
    const identifier = (await node.get("identifier")) || "temporary";
    const target = triggerId || node.trigger.id;
    const slug = game.pf2e.system.sluggify(`${target}-${identifier}`);
    const option = `self:effect:${slug}`;

    return {
        identifier,
        slug,
        option,
    };
}

type NodeEffectData = {
    duration: TriggerDurationEntry;
    unidentified: boolean;
    origin: TargetDocuments | undefined;
};

type NodeTemporaryData = {
    identifier: string;
    slug: string;
    option: string;
};

type TemporaryDataNode = TriggerNode<{
    inputs: Array<{ key: "identifier"; type: "text" } | NodeSchemaInput>;
}>;

type EffectDataNode = TriggerNode<{
    inputs: Array<
        | { key: "duration"; type: "duration" }
        | { key: "unidentified"; type: "boolean" }
        | NodeSchemaInput
    >;
}>;

export { getEffectData, getTemporaryIdentifier };
