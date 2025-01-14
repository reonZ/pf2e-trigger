import { BlueprintNode } from "@blueprint/node/blueprint-node";
import { BlueprintLayer } from "./layer";
import { NodeData } from "@data/data-node";
import { createBlueprintNode } from "@blueprint/node/blueprint-node-list";
import { R } from "module-helpers";
import { NodeEntryId, segmentEntryId } from "@data/data-entry";
import { BlueprintEntry } from "@blueprint/node/entry/blueprint-entry";

class BlueprintNodesLayer extends BlueprintLayer<BlueprintNode> {
    #nodes: Collection<BlueprintNode> = new Collection();

    initialize(): void {
        for (const node of R.values(this.trigger?.nodes ?? {})) {
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

    getEntryFromId(id: NodeEntryId): BlueprintEntry | undefined {
        const { nodeId } = segmentEntryId(id);
        return this.getNode(nodeId)?.getEntryFromId(id);
    }

    addNode(node: NodeData | BlueprintNode): BlueprintNode {
        const blueprintNode = node instanceof BlueprintNode ? node : createBlueprintNode(node);

        this.#nodes.set(node.id, blueprintNode);
        this.addChild(blueprintNode);

        return blueprintNode;
    }

    removeNode(nodeOrId: NodeData | BlueprintNode | string) {
        const node =
            nodeOrId instanceof BlueprintNode
                ? nodeOrId
                : this.#nodes.get(R.isString(nodeOrId) ? nodeOrId : nodeOrId.id);
        if (!node) return;

        node.eventMode = "none";

        this.#nodes.delete(node.id);

        if (this.removeChild(node)) {
            node.destroy();
        }
    }
}

export { BlueprintNodesLayer };
