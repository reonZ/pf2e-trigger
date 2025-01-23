import { NodeEntryType, NodeSchema, NodeSchemaOutputEntry } from "schema/schema";
import { BlueprintNode } from "./blueprint-node";

class VariableBlueprintNode extends BlueprintNode {
    get title(): null {
        return null;
    }

    get schema(): NodeSchema {
        const outputs: NodeSchemaOutputEntry[] = [
            {
                key: "value",
                type: this.getValue("inputs", "type") as NodeEntryType,
                label: this.getValue("inputs", "label") as string,
            },
        ];

        return {
            ...super.schema,
            inputs: undefined,
            outputs,
        };
    }
}

export { VariableBlueprintNode };
