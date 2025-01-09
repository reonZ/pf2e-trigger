import { EventTriggerNode } from "./event";

abstract class TurnEventTriggerNode extends EventTriggerNode {}

class StartTurnEventTriggerNode extends TurnEventTriggerNode {}

class EndTurnEventTriggerNode extends TurnEventTriggerNode {}

export { TurnEventTriggerNode, StartTurnEventTriggerNode, EndTurnEventTriggerNode };
