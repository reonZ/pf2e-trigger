import { TriggerNode } from "../trigger-node";

class TriggerEvent extends TriggerNode<EventSchema> {
    async execute(): Promise<void> {
        return this.send("out");
    }
}

export { TriggerEvent };
