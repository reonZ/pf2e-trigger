import { RegionTriggerOptions } from "hook";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RegionTriggerNode extends TriggerNode<
    NodeSchemaOf<"event", "region-event">,
    RegionTriggerOptions
> {
    async execute(): Promise<boolean> {
        const event = this.getOption("event");
        this.setVariable("event", event);
        return this.send("out");
    }
}

export { RegionTriggerNode };
