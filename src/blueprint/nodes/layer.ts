import { Blueprint, BlueprintNode } from "blueprint";
import { TriggerData, TriggerNodeData } from "data";

class BlueprintNodesLayer extends PIXI.Container<PIXI.Container> {
    #blueprint: Blueprint;
    #drawn = false;
    #nodes: Collection<BlueprintNode> = new Collection();

    constructor(blueprint: Blueprint) {
        super();
        this.#blueprint = blueprint;
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    draw(trigger: TriggerData) {
        if (this.#drawn) return;
        this.#drawn = true;

        for (const data of trigger.nodes) {
            this.addNode(data);
        }
    }

    addNode(data: TriggerNodeData): BlueprintNode {
        const node = new BlueprintNode(data);
        this.#nodes.set(node.id, node);
        return this.addChild(node);
    }

    clear() {
        if (!this.#drawn) return;
        this.#drawn = false;

        this.removeAllListeners();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }
}

export { BlueprintNodesLayer };
