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
    const otherTargets = await node.getTargetsTokensUUIDs("target");

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

async function filterTargets(
    node: FilterTargetsNode,
    find: true
): Promise<TargetDocuments | undefined>;
async function filterTargets(node: FilterTargetsNode, find: false): Promise<TargetDocuments[]>;
async function filterTargets(node: FilterTargetsNode, find: boolean) {
    const code = await node.get("callback");
    const targets = await node.get("multi");

    if (!targets?.length) {
        return [];
    }

    const values = await node.getCustomInputs(true);

    try {
        const Fn = function () {}.constructor as SyncFunction;
        const callback = new Fn("target", "inputs", "values", code);

        return targets[find ? "find" : "filter"]((target) => callback(target, values, values));
    } catch {}

    return [];
}

type FilterTargetsNode = TriggerNode<{
    inputs: [{ key: "callback"; type: "text" }, { key: "multi"; type: "multi" }];
}>;

type SyncFunction = {
    new <T>(...args: any[]): (...args: any[]) => T;
};

type NodeDamageData = {
    formula: string;
    roll: TriggerRollEntry;
    damageOptions: WithRequired<RollDamageOptions, "target" | "extraRollOptions" | "toolbelt">;
};

type RollDamageNode = TriggerNode<{
    inputs: [
        { key: "formula"; type: "text" },
        { key: "roll"; type: "roll" },
        { key: "target"; type: "multi" }
    ];
}>;

type NodeTemporaryData = {
    identifier: string;
    slug: string;
};

type TemporaryDataNode = TriggerNode<{
    inputs: Array<{ key: "identifier"; type: "text" } | NodeSchemaInput>;
}>;

export { filterTargets, getRollDamageData, getTemporaryIdentifier };
export type { RollDamageNode };
