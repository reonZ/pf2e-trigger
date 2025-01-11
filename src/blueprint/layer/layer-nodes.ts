import { NodeEntryId, TriggerNode } from "@node/trigger-node";
import { BlueprintLayer } from "./layer";
import { BlueprintNode } from "@blueprint/node/blueprint-node";
import { createBlueprintNode } from "@blueprint/node/blueprint-nodes-list";
import { BlueprintNodeEntry } from "@blueprint/node/node-entry";
import { Trigger } from "@trigger/trigger";
import { BlueprintConnectionsLayer } from "./layer-connections";

class BlueprintNodesLayer extends BlueprintLayer<BlueprintNode> {
    #nodes: Collection<BlueprintNode> = new Collection();

    get connections(): BlueprintConnectionsLayer {
        return this.blueprint.layers.connections;
    }

    initialize(): void {
        const trigger = this.trigger;
        if (!trigger) return;

        for (const node of trigger.nodes()) {
            this.addNode(node);
        }
    }

    reset(): void {
        super.reset();
        this.#nodes.clear();
    }

    *nodes(): Generator<BlueprintNode, void, undefined> {
        for (const node of this.#nodes) {
            yield node;
        }
    }

    getNode(id: string): BlueprintNode | undefined {
        return this.#nodes.get(id);
    }

    getEntryFromId(id: NodeEntryId): BlueprintNodeEntry | undefined {
        const { nodeId } = Trigger.segmentEntryId(id);
        return this.getNode(nodeId)?.getEntryFromId(id);
    }

    addNode(node: TriggerNode | BlueprintNode): BlueprintNode {
        const blueprintNode = node instanceof BlueprintNode ? node : createBlueprintNode(node);

        this.#nodes.set(node.id, blueprintNode);
        this.addChild(blueprintNode);

        return blueprintNode;
    }

    removeNode(node: BlueprintNode) {
        node.eventMode = "none";

        this.#nodes.delete(node.id);

        if (this.removeChild(node)) {
            node.destroy();
        }
    }

    onConnect(point: Point, other: BlueprintNodeEntry): BlueprintNodeEntry | null | undefined {
        for (const node of this.nodes()) {
            const connected = node.onConnect(point, other);

            if (connected !== undefined) {
                return connected;
            }
        }
    }
}

export { BlueprintNodesLayer };
