import {
    StartTurnEventTriggerNode,
    EndTurnEventTriggerNode,
    TurnEventTriggerNode,
} from "@node/event/turn";
import { EventBlueprintNode } from "./blueprint-event";

abstract class TurnEventBlueprintNode extends EventBlueprintNode {}

interface TurnEventBlueprintNode extends EventBlueprintNode {
    get trigger(): TurnEventTriggerNode;
}

class StartTurnEventBlueprintNode extends TurnEventBlueprintNode {
    get icon(): string {
        return "\uf251";
    }
}

interface StartTurnEventBlueprintNode extends TurnEventBlueprintNode {
    get trigger(): StartTurnEventTriggerNode;
}

class EndTurnEventBlueprintNode extends TurnEventBlueprintNode {
    get icon(): string {
        return "\uf253";
    }
}

interface EndTurnEventBlueprintNode extends TurnEventBlueprintNode {
    get trigger(): EndTurnEventTriggerNode;
}

export { StartTurnEventBlueprintNode, EndTurnEventBlueprintNode };
