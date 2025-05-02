import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ConsoleLogTriggerNode extends TriggerNode<ConsoleLogSchema> {
    execute(): Promise<boolean> {
        return this.send("out");
    }
}

type ConsoleLogSchema = NodeSchemaOf<"action", "console-log">;

export { ConsoleLogTriggerNode };
