import { BlueprintNodeChild } from "./blueprint-node-child";

abstract class BlueprintNodeLayout extends BlueprintNodeChild {
    abstract get innerWidth(): number;

    get opacity(): number {
        return this.node.opacity;
    }
}

export { BlueprintNodeLayout };
