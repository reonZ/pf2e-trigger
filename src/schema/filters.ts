import { BlueprintMenuGroup, BlueprintMenuGroupEntry } from "blueprint";
import { getCompatibleTypes, NODE_TYPES, NodeEntryType, NodeType } from "data";
import { dataToDatasetString, joinStr, localize, R } from "module-helpers";
import { NodeSchemaModuleId } from "./model";
import {
    getSchema,
    hasInBridge,
    hasInputConnector,
    hasOuts,
    NodeKey,
    NodeRawSchema,
    SCHEMAS,
} from "./schema";

const FILTER_TYPES: NodeType[] = R.difference(NODE_TYPES, ["event", "subtrigger", "variable"]);

let FILTERS: FilterGroup[] | undefined;

function createFilters(): FilterGroup[] {
    return R.pipe(
        R.entries(SCHEMAS) as [NodeType, Record<NodeKey, NodeRawSchema>][],
        R.filter(([type]) => FILTER_TYPES.includes(type)),
        R.flatMap(([type, schemas]) => {
            return R.pipe(
                R.entries(schemas),
                R.map(([key]): PrefilterGroupEntry | undefined => {
                    const schema = getSchema({ type, key });
                    if (!schema) return;

                    const [inputs, outputs] = R.pipe(
                        ["inputs", "outputs"] as const,
                        R.map((category): NodeEntryType[] => {
                            if (
                                category === "inputs" &&
                                !hasInputConnector({ type, key }, schema)
                            ) {
                                return [];
                            }

                            return R.pipe(
                                schema[category] as { type: NodeEntryType }[],
                                R.flatMap(({ type }) => {
                                    return getCompatibleTypes(type, category);
                                }),
                                R.unique()
                            );
                        })
                    );

                    if (hasInBridge({ type, key })) {
                        inputs.push("bridge");
                    }

                    if (hasOuts({ type, key })) {
                        outputs.push("bridge");
                    }

                    return {
                        data: dataToDatasetString({ type, key }),
                        id: joinStr(".", type, schema.module),
                        inputs,
                        outputs,
                        key,
                        label: localize("node", type, key, "label"),
                        module: schema.module,
                        type,
                    };
                }),
                R.filter(R.isTruthy)
            );
        }),
        R.groupBy(R.prop("id")),
        R.entries(),
        R.sortBy(([id]) => id),
        R.map(([_, entries]): FilterGroup => {
            const { module, type } = entries[0];
            return {
                entries: R.sortBy(entries, R.prop("label")),
                isSub: !!module,
                title: module ?? localize("node", type, "title"),
            };
        })
    );
}

function getFilterGroups(): FilterGroup[] {
    return (FILTERS ??= createFilters()).slice();
}

type PrefilterGroupEntry = FilterGroupEntry & {
    id: string;
    module: NodeSchemaModuleId | undefined;
};

type FilterGroupEntry = BlueprintMenuGroupEntry & {
    inputs: NodeEntryType[];
    outputs: NodeEntryType[];
    key: NodeKey;
    type: NodeType;
};

type FilterGroup = BlueprintMenuGroup<FilterGroupEntry>;

export { getFilterGroups };
export type { FilterGroup, FilterGroupEntry };
