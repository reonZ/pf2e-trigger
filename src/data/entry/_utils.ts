import { R } from "module-helpers";

const NODE_ENTRY_CATEGORIES = ["inputs", "outputs"] as const;

function isEntryCategory(category: unknown): category is NodeEntryCategory {
    return R.isString(category) && R.isIncludedIn(category, NODE_ENTRY_CATEGORIES);
}

type NodeEntryCategory = (typeof NODE_ENTRY_CATEGORIES)[number];

export type { NodeEntryCategory };
export { NODE_ENTRY_CATEGORIES, isEntryCategory };
