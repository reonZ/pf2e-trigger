import { TriggerData } from "data";
import { BlueprintNode } from "blueprint";

class BlueprintNodesLayer extends PIXI.Container<PIXI.Container> {
    #drawn = false;
    #nodes: Collection<BlueprintNode> = new Collection();

    draw(trigger: TriggerData) {
        if (this.#drawn) return;
        this.#drawn = true;

        for (const nodeData of trigger.nodes) {
            const node = new BlueprintNode(nodeData);
            this.#nodes.set(node.id, node);
            this.addChild(node);
        }
    }

    clear() {
        if (!this.#drawn) return;
        this.#drawn = false;
    }
}

export { BlueprintNodesLayer };
