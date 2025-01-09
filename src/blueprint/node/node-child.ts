import { Blueprint } from "@blueprint/blueprint";
import { BlueprintNode } from "./blueprint-node";

abstract class BlueprintNodeChild extends PIXI.Graphics {
    constructor(parent: BlueprintNode) {
        super();

        parent.addChild(this);
    }

    abstract paint(maxWidth: number): void;

    get node(): BlueprintNode {
        return this.parent;
    }

    get blueprint(): Blueprint {
        return this.parent.blueprint;
    }
}

interface BlueprintNodeChild extends PIXI.Graphics {
    parent: BlueprintNode;
}

abstract class BlueprintNodeLayout extends BlueprintNodeChild {
    abstract get innerWidth(): number;
}

export { BlueprintNodeChild, BlueprintNodeLayout };
