import { BlueprintNode } from "../blueprint-node";

abstract class ActionBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return 0x2162bd;
    }
}

export { ActionBlueprintNode };
