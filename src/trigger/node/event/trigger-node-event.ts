import { EventSchema } from "schema/event/schema-event";
import { TriggerNode } from "../trigger-node";

class EventTriggerNode extends TriggerNode<EventSchema> {
    protected async _execute(origin: TargetDocuments) {
        return this.send("out", origin);
    }
}

export { EventTriggerNode };
