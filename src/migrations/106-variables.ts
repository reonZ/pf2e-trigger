import { isEntryId, segmentEntryId } from "data/data-entry";
import { processNodeData } from "data/data-node";
import { R, getSetting, setSetting, userIsActiveGM } from "module-helpers";
import { ModuleMigration } from "module-helpers/dist/migration";
import { getSchema } from "schema/schema-list";

export default {
    version: 1.06,
    migrateSettings: migrateVariables,
} satisfies ModuleMigration;

async function migrateVariables(): Promise<string[] | undefined> {
    if (!userIsActiveGM()) return;

    const current = getSetting<TriggerRawData[]>("triggers");
    if (!current?.length) return;

    const triggers = fu.deepClone(current);

    for (const trigger of triggers) {
        const nodes = trigger.nodes;
        if (!trigger.variables || !nodes?.length) continue;

        const variables: TriggerDataVariables = {};

        for (const [entryId, entry] of R.entries(trigger.variables)) {
            if (R.isPlainObject(entry) || !isEntryId(entryId)) {
                variables[entryId] = entry;
                continue;
            }

            const { key, nodeId } = segmentEntryId(entryId);
            const nodeData = nodes.find((node) => node && node.id === nodeId);
            const node = processNodeData(nodeData);
            if (!node) continue;

            const schema = getSchema(node);
            const output = schema.outputs.find((output) => output.key === key);
            if (!output || !("type" in output)) continue;

            variables[entryId] = { label: entry, type: output.type };
        }

        trigger.variables = variables;
    }

    await setSetting("triggers", triggers);

    return ["pf2e-trigger.triggers"];
}
