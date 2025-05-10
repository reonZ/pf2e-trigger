import { ActorPF2e } from "module-helpers";
import { NodeSchemaInput, SchemaEffectDetails } from "schema";
import { TriggerDurationEntry, TriggerNode } from "trigger";

async function getEffectData(node: EffectDataNode): Promise<NodeEffectData | undefined> {
    const actor = await node.getTargetActor("target");
    if (!actor) return;

    const name = await node.get("label");
    const duration = await node.get("duration");
    const unidentified = await node.get("unidentified");

    const origin = duration.origin;
    delete duration.origin;

    return {
        actor,
        duration,
        name,
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

    return {
        identifier,
        slug,
    };
}

type NodeEffectData = {
    actor: ActorPF2e;
    duration: TriggerDurationEntry;
    name: string;
    unidentified: boolean;
    origin: TargetDocuments | undefined;
};

type NodeTemporaryData = {
    identifier: string;
    slug: string;
};

type TemporaryDataNode = TriggerNode<{
    inputs: Array<{ key: "identifier"; type: "text" } | NodeSchemaInput>;
}>;

type EffectDataNode = TriggerNode<{
    inputs: Array<SchemaEffectDetails | NodeSchemaInput>;
}>;

export { getEffectData, getTemporaryIdentifier };
