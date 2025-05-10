import { NodeSchemaInput } from "schema";
import { TriggerNode } from "trigger";

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

type NodeTemporaryData = {
    identifier: string;
    slug: string;
};

type TemporaryDataNode = TriggerNode<{
    inputs: Array<{ key: "identifier"; type: "text" } | NodeSchemaInput>;
}>;

export { getTemporaryIdentifier };
