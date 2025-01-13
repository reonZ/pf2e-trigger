import { R } from "module-helpers";
import { NodeEntryId } from "./data-entry";
import { NodeData, NodeRawData, processNodeData } from "./data-node";

// class TriggerNode<T extends NodeType, K extends NodeKey<T>> {
//     #schema: NodeSchemas[T][K];

//     constructor(data: NodeData<T, K>) {
//         this.#schema = getSchema(data.type, data.key);
//     }
// }

// class ConditionNode<T extends NodeType, K extends NodeKey<T>> extends TriggerNode<T, K> {}

// class HasItemTriggerNode extends ConditionNode<"condition", "has-item"> {}

function processTriggerData(data: TriggerRawData): TriggerData | null {
    if (!R.isPlainObject(data) || !R.isString(data.id) || !R.isString(data.name)) {
        return null;
    }

    let event: NodeData | undefined;

    const nodes: TriggerData["nodes"] = R.pipe(
        data.nodes ?? [],
        R.map((data) => {
            const node = processNodeData(data);

            if (node?.type === "event") {
                if (event) return null;
                event = node;
            }

            return node;
        }),
        R.filter(R.isTruthy),
        R.mapToObj((node) => [node.id, node])
    );

    if (!event) {
        return null;
    }

    for (const node of R.values(nodes)) {
        for (const category of ["inputs", "outputs"] as const) {
            for (const [key, entry] of R.entries(node[category])) {
                if (!entry.ids) continue;

                const originId = `${node.id}.${category}.${key}` as NodeEntryId;

                for (const targetId of entry.ids) {
                    const targetIds = fu.getProperty(nodes, `${targetId}.ids`);
                    if (!R.isArray(targetIds) || targetIds.includes(originId)) continue;

                    node[category][key].ids?.findSplice((x) => x === targetId);
                }
            }
        }
    }

    return {
        id: data.id,
        name: data.name.trim() || data.id,
        nodes,
        event,
    };
}

type TriggerData = BaseTriggerData & {
    nodes: Record<string, NodeData>;
    event: NodeData;
};

type TriggerRawData = MaybePartial<
    BaseTriggerData & {
        nodes: NodeRawData[];
    }
>;

type BaseTriggerData = {
    id: string;
    name: string;
};

export { processTriggerData };
export type { TriggerData, TriggerRawData };
