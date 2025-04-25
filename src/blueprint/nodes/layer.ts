import { Blueprint, BlueprintNode } from "blueprint";
import { NodeEntryId, TriggerNodeData } from "data";

class BlueprintNodesLayer extends PIXI.Container<PIXI.Container> {
    #blueprint: Blueprint;
    #drawn: boolean = false;
    #nodes: Collection<BlueprintNode> = new Collection();

    constructor(blueprint: Blueprint) {
        super();

        this.#blueprint = blueprint;
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    *nodes(): Generator<BlueprintNode, void, undefined> {
        for (const node of this.#nodes) {
            yield node;
        }
    }

    draw() {
        const trigger = this.blueprint.trigger;
        if (this.#drawn || !trigger) return;
        this.#drawn = true;

        for (const data of trigger.nodes) {
            this.add(data);
        }
    }

    get(id: NodeEntryId): BlueprintNode | undefined {
        return this.#nodes.get(id.split(".")[0]);
    }

    add(data: TriggerNodeData): BlueprintNode {
        const node = new BlueprintNode(this.blueprint, data);

        this.#nodes.set(node.id, node);
        this.addChild(node);

        return node;
    }

    delete(node: BlueprintNode): boolean {
        for (const entry of node.entries()) {
            entry.disconnect(true);
        }

        // TODO
        // this.deleteVariables(id, { skipThis: node.type === "event" });

        return this.#nodes.delete(node.id);
    }

    clear() {
        this.removeAllListeners();

        this.#drawn = false;
        this.#nodes.clear();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }
}

export { BlueprintNodesLayer };
