import { EventTriggerNode } from "@node/event/event";
import { BlueprintNode } from "../blueprint-node";

abstract class EventBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return 0xc40000;
    }

    get canDrag(): boolean {
        return false;
    }
}

interface EventBlueprintNode extends BlueprintNode {
    get trigger(): EventTriggerNode;
}

export { EventBlueprintNode };
