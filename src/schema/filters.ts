import { NODE_TYPES, NodeEntryType, NodeType, NonBridgeEntry } from "data";
import { dataToDatasetString, joinStr, localize, R } from "module-helpers";
import { NodeSchemaModuleId } from "./model";
import { getSchema, NodeKey, NodeRawSchema, SCHEMAS } from "./schema";

const FILTER_TYPES = R.difference(NODE_TYPES, [
    "event",
    "subtrigger",
    "variable",
] as const) as FilterNodeType[];

let FILTERS: NodeFilterGroup[] | undefined;

function createFilters(): NodeFilterGroup[] {
    return R.pipe(
        R.entries(SCHEMAS) as [FilterNodeType, Record<NodeKey, NodeRawSchema>][],
        R.filter(([type]) => FILTER_TYPES.includes(type)),
        R.flatMap(([type, schemas]) => {
            return R.pipe(
                R.entries(schemas),
                R.map(([key]): NodeFilter | undefined => {
                    const schema = getSchema({ type, key });
                    if (!schema) return;

                    return {
                        dataset: dataToDatasetString({ type, key }),
                        id: joinStr(".", type, schema.module),
                        inputs: schema.inputs.map((x) => x.type),
                        key,
                        label: localize("node", type, key, "label"),
                        module: schema.module,
                        outputs: schema.outputs.map((x) => x.type),
                        type,
                    };
                }),
                R.filter(R.isTruthy)
            );
        }),
        R.groupBy(R.prop("id")),
        R.entries(),
        R.sortBy(([id]) => id),
        R.map(([_, entries]): NodeFilterGroup => {
            const { module, type } = entries[0];
            return {
                entries,
                isModule: !!module,
                title: module ?? localize("node", type, "title"),
            };
        })
    );
}

function getFilters(sourceEntry?: { type: NodeEntryType; key: string }): NodeFilterGroup[] {
    const filters = (FILTERS ??= createFilters());

    if (!sourceEntry) {
        return filters;
    }

    return [];
}

type FilterNodeType = Exclude<NodeType, "event" | "subtrigger" | "variable" | "setter">;

type NodeFilter = {
    dataset: string;
    id: string;
    inputs: NonBridgeEntry[];
    key: NodeKey;
    label: string;
    module: NodeSchemaModuleId | undefined;
    outputs: NonBridgeEntry[];
    type: FilterNodeType;
};

type NodeFilterGroup = {
    entries: NodeFilter[];
    isModule: boolean;
    title: string;
};

export { getFilters };
export type { NodeFilterGroup };
