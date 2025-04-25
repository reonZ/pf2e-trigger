import { BlueprintMenuGroup, BlueprintMenuGroupEntry } from "blueprint";
import { NODE_TYPES, NodeEntryType, NodeType } from "data";
import { dataToDatasetString, joinStr, localize, R } from "module-helpers";
import { NodeSchemaModuleId } from "./model";
import { getSchema, hasInBridge, NodeKey, NodeRawSchema, SCHEMAS } from "./schema";

const COMPATIBLE_ENTRY_GROUPS = [["dc", "number"]] as const;

const COMPATIBLE_ENTRIES = R.pipe(
    COMPATIBLE_ENTRY_GROUPS,
    R.flatMap((group) => {
        return R.pipe(
            group,
            R.map((entry): [NodeEntryType, NodeEntryType[]] => {
                return [entry, group.filter((y) => y !== entry)];
            })
        );
    }),
    R.fromEntries()
);

const FILTER_TYPES = R.difference(NODE_TYPES, [
    "event",
    "subtrigger",
    "variable",
]) as FilterNodeType[];

let FILTERS: FilterGroup[] | undefined;

function createFilters(): FilterGroup[] {
    return R.pipe(
        R.entries(SCHEMAS) as [FilterNodeType, Record<NodeKey, NodeRawSchema>][],
        R.filter(([type]) => FILTER_TYPES.includes(type)),
        R.flatMap(([type, schemas]) => {
            return R.pipe(
                R.entries(schemas),
                R.map(([key]): FilterGroupFilter | undefined => {
                    const schema = getSchema(type, key);
                    if (!schema) return;

                    const [inputs, outputs] = R.pipe(
                        ["inputs", "outputs"] as const,
                        R.map((category): NodeEntryType[] => {
                            return R.pipe(
                                schema[category] as { type: NodeEntryType }[],
                                R.flatMap(({ type }) => {
                                    return [type, ...(COMPATIBLE_ENTRIES[type] ?? [])];
                                }),
                                R.unique()
                            );
                        })
                    );

                    if (hasInBridge({ type, key })) {
                        inputs.push("bridge");
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
                entries,
                isSub: !!module,
                title: module ?? localize("node", type, "title"),
            };
        })
    );
}

function getFilterGroups(): FilterGroup[] {
    return (FILTERS ??= createFilters());
}

type FilterNodeType = Exclude<NodeType, "event" | "subtrigger" | "variable">;

type FilterGroupFilter = BlueprintMenuGroupEntry & {
    id: string;
    inputs: NodeEntryType[];
    outputs: NodeEntryType[];
    key: NodeKey;
    module: NodeSchemaModuleId | undefined;
    type: FilterNodeType;
};

type FilterGroup = BlueprintMenuGroup<FilterGroupFilter>;

type FilterNodeData = { type: NodeType; key: NodeKey };

export { COMPATIBLE_ENTRIES, getFilterGroups };
export type { FilterGroup, FilterGroupFilter, FilterNodeData };
