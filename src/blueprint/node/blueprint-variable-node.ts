import { NodeEntryType, NodeSchema, NodeSchemaOutputEntry } from "schema/schema";
import { BlueprintNode } from "./blueprint-node";
import { localize } from "module-helpers";

class VariableBlueprintNode extends BlueprintNode {
    get title(): null {
        return null;
    }

    get schema(): NodeSchema {
        const nodeId = this.getValue("inputs", "id") as string;
        const node = this.blueprint.layers.nodes.getNode(nodeId);

        if (!node) {
            return super.schema;
        }

        const key = this.getValue("inputs", "key") as string;
        const label = localize("node.variable", key);
        const counter = node.counter;

        const outputs: NodeSchemaOutputEntry[] = [
            {
                key: "value",
                type: this.getValue("inputs", "type") as NodeEntryType,
                label: counter > 1 ? `${label} (${counter})` : label,
            },
        ];

        return {
            ...super.schema,
            inputs: undefined,
            outputs,
        };
    }

    get nodeId(): string {
        return this.getValue("inputs", "id") as string;
    }

    get variableKey(): string {
        return this.getValue("inputs", "key") as string;
    }

    protected get context() {
        return super.context.filter((x) => x !== "duplicate");
    }
}

export { VariableBlueprintNode };
