import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class LoopTargetsTriggerNode extends TriggerNode<NodeSchemaOf<"action", "loop-targets">> {
    async execute(): Promise<boolean> {
        const targets = (await this.get("multi")) ?? [];

        for (const target of targets) {
            this.setVariable("target", target);

            if (!(await this.send("out"))) {
                return false;
            }
        }

        return true;
    }
}

export { LoopTargetsTriggerNode };
