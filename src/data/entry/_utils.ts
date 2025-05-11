import { TriggerNodeData } from "data/node";
import { localize, localizeIfExist, R } from "module-helpers";
import { BaseNodeSchemaEntry } from "schema";

const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

function isEntryCategory(category: unknown): category is NodeEntryCategory {
    return R.isString(category) && R.isIncludedIn(category, NODE_ENTRY_CATEGORIES);
}

function getEntryLabel(schema: BaseNodeSchemaEntry, node: TriggerNodeData) {
    if (schema.label) {
        if (schema.custom) {
            return schema.label;
        }

        return (
            localizeIfExist("node", schema.label, "entry", schema.key) ??
            localizeIfExist("entry", schema.label) ??
            localizeIfExist(schema.label) ??
            game.i18n.localize(schema.label)
        );
    }

    return (
        localizeIfExist(`${node.localizePath}.entry`, schema.key) ?? localize("entry", schema.key)
    );
}

type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];

export { getEntryLabel, isEntryCategory, NODE_ENTRY_CATEGORIES };
export type { NodeEntryCategory };
