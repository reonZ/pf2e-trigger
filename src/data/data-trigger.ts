import { R } from "module-helpers";
import { isEventNode, processNodeData } from "./data-node";

const NODE_TYPE_ORDER: Record<NodeType, number> = {
    event: 0,
    condition: 1,
    action: 2,
    logic: 3,
    value: 4,
    macro: 5,
    subtrigger: 6,
    variable: 7,
    converter: 8,
    splitter: 9,
};

function createTriggerData(name: string, event?: NodeEventKey): TriggerData | null {
    const data: Required<TriggerRawData> = {
        id: fu.randomID(),
        name,
        disabled: false,
        nodes: [],
    };

    if (event) {
        data.nodes.push({
            id: fu.randomID(),
            type: "event",
            key: event,
            x: 100,
            y: 200,
        });
    } else {
        data.nodes.push(
            {
                id: fu.randomID(),
                type: "subtrigger",
                key: "subtrigger-input",
                x: 100,
                y: 200,
            },
            {
                id: fu.randomID(),
                type: "subtrigger",
                key: "subtrigger-output",
                x: 700,
                y: 200,
            }
        );
    }

    return processTriggerData(data);
}

function serializeTrigger(trigger: WithPartial<TriggerData, "id">): TriggerRawData {
    const nodes = R.pipe(
        R.values(trigger.nodes),
        R.sortBy((node) => NODE_TYPE_ORDER[node.type])
    );

    return {
        id: trigger.id,
        name: trigger.name,
        nodes: fu.deepClone(nodes),
        disabled: trigger.disabled,
    };
}

function processTriggerData(
    triggerData: Maybe<TriggerRawData>,
    subtriggers?: TriggerData[]
): TriggerData | null {
    if (!R.isPlainObject(triggerData)) {
        return null;
    }

    let event: NodeData | undefined;
    let aura: NodeData | undefined;

    const nodes: TriggerData["nodes"] = R.pipe(
        triggerData.nodes ?? [],
        R.map((nodeData) => {
            const node = processNodeData(nodeData);
            if (!node) return;

            if (isEventNode(node)) {
                if (event) return null;
                event = node;
            } else if (node.type === "condition" && node.key === "inside-aura") {
                aura = node;
            }

            // if (node.type === "subtrigger" && R.isString(node.subId)) {
            //
            // }

            return node;
        }),
        R.filter(R.isTruthy),
        R.mapToObj((node) => [node.id, node])
    );

    if (!event) {
        return null;
    }

    // for (const node of R.values(nodes)) {
    //     for (const category of ["inputs", "outputs"] as const) {
    //         for (const [key, entry] of R.entries(node[category])) {
    //             if (!entry.ids) continue;

    //             const originId = `${node.id}.${category}.${key}` as NodeEntryId;

    //             for (const targetId of entry.ids) {
    //                 const targetIds = fu.getProperty(nodes, `${targetId}.ids`);
    //                 if (!R.isArray(targetIds) || targetIds.includes(originId)) continue;

    //                 node[category][key].ids?.findSplice((x) => x === targetId);
    //             }
    //         }
    //     }
    // }

    const id = R.isString(triggerData.id) ? triggerData.id : fu.randomID();

    return {
        id,
        name: triggerData.name?.trim() || id,
        nodes,
        event,
        aura,
        disabled: !!triggerData.disabled,
        isSub: event.type === "subtrigger" && !event.subId,
    };
}

export { createTriggerData, processTriggerData, serializeTrigger };
