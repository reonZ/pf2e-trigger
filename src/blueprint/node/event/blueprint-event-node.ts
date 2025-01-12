import { BlueprintNode } from "../blueprint-node";

abstract class EventBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return 0xc40000;
    }

    get canDrag(): boolean {
        return false;
    }
}

export { EventBlueprintNode };
