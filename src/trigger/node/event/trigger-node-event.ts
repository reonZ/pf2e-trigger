import { EventSchema } from "schema/event/schema-event";
import { TriggerExecuteOptions } from "trigger/trigger";
import { TriggerNode } from "../trigger-node";

class EventTriggerNode extends TriggerNode<EventSchema> {
    protected async _execute(origin: TargetDocuments, options: TriggerExecuteOptions) {
        this.send("out", origin, options);
    }
}

export { EventTriggerNode };
