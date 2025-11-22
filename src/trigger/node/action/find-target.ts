import { NodeSchemaOf } from "schema";
import { filterTargets, TriggerNode } from "trigger";

class FindTargetTriggerNode extends TriggerNode<NodeSchemaOf<"action", "find-target">> {
    async execute(): Promise<boolean> {
        const result = await filterTargets(this, true);

        this.setVariable("result", result);

        return this.send("out");
    }
}

export { FindTargetTriggerNode };
