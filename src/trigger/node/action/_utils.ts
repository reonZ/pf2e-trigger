import { getExtraRollOptions, RollDamageOptions } from "module-helpers";
import { NodeSchemaInput } from "schema";
import { TriggerNode, TriggerRollEntry } from "trigger";

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

async function getRollDamageData(node: RollDamageNode): Promise<NodeDamageData | undefined> {
    const formula = await node.get("formula");
    const target = await node.getTarget("target");
    if (!formula || !target) return;

    const roll = await node.get("roll");
    const otherTargets = await node.getCustomTargets();

    return {
        formula,
        roll,
        damageOptions: {
            extraRollOptions: getExtraRollOptions(roll),
            item: roll.item,
            notes: roll.notes,
            origin: roll.origin,
            skipDialog: true,
            target,
            toolbelt: {
                targets: otherTargets,
            },
        },
    };
}

type NodeDamageData = {
    formula: string;
    roll: TriggerRollEntry;
    damageOptions: WithRequired<RollDamageOptions, "target" | "extraRollOptions" | "toolbelt">;
};

type RollDamageNode = TriggerNode<{
    inputs: Array<
        { key: "formula"; type: "text" } | { key: "roll"; type: "roll" } | NodeSchemaInput
    >;
}>;

type NodeTemporaryData = {
    identifier: string;
    slug: string;
};

type TemporaryDataNode = TriggerNode<{
    inputs: Array<{ key: "identifier"; type: "text" } | NodeSchemaInput>;
}>;

export { getRollDamageData, getTemporaryIdentifier };
