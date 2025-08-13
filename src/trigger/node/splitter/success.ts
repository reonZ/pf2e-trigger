import { degreeOfSuccessString } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SuccessSplitterTriggerNode extends TriggerNode<NodeSchemaOf<"splitter", "success-splitter">> {
    async execute(): Promise<boolean> {
        const value = await this.get("input");
        const success = degreeOfSuccessString(value) ?? "criticalFailure";

        return this.send(success);
    }
}

export { SuccessSplitterTriggerNode };
