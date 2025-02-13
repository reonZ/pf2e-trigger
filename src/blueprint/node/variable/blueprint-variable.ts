import { Blueprint } from "blueprint/blueprint";
import { BlueprintNode } from "../blueprint-node";
import { segmentEntryId } from "data/data-entry";

class VariableBlueprintNode extends BlueprintNode {
    #nodeId: string;
    #variableKey: string;

    constructor(blueprint: Blueprint, data: NodeData) {
        super(blueprint, data);

        const { nodeId, key } = segmentEntryId(data.inputs.input.ids![0]);
        this.#nodeId = nodeId;
        this.#variableKey = key;
    }

    get title(): null {
        return null;
    }

    get schema(): NodeSchema {
        return {
            ...super.schema,
            inputs: [],
        };
    }

    get nodeId(): string {
        return this.#nodeId;
    }

    get variableKey(): string {
        return this.#variableKey;
    }

    get context() {
        return ["delete-node"];
    }
}

export { VariableBlueprintNode };
