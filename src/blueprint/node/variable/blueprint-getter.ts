import { VariableBlueprintNode } from "./blueprint-variable";

class GetterBlueprintNode extends VariableBlueprintNode {
    get title(): null {
        return null;
    }

    get schema(): NodeSchema {
        return {
            ...super.schema,
            inputs: [],
        };
    }

    get context(): string[] {
        return ["delete-node"];
    }
}

export { GetterBlueprintNode };
