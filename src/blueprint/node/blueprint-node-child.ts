import { Blueprint } from "blueprint/blueprint";
import { BlueprintNode } from "./blueprint-node";

abstract class BlueprintNodeChild extends PIXI.Graphics {
    #node: BlueprintNode;

    constructor(node: BlueprintNode) {
        super();

        this.#node = node;

        node.addChild(this);
    }

    abstract paint(maxWidth: number): void;

    get node(): BlueprintNode {
        return this.#node;
    }

    get blueprint(): Blueprint {
        return this.node.blueprint;
    }

    get schema(): NodeSchema {
        return this.#node.schema;
    }
}

export { BlueprintNodeChild };
