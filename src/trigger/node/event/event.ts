import { TriggerNode } from "trigger";

class EventTriggerNode extends TriggerNode {
    async execute(): Promise<boolean> {
        return this.send("out");
    }
}

export { EventTriggerNode };
