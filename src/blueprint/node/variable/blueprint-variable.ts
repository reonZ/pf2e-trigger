import { Blueprint } from "blueprint/blueprint";
import { BlueprintNode } from "../blueprint-node";
import { segmentEntryId } from "data/data-entry";

abstract class VariableBlueprintNode extends BlueprintNode {
    #nodeId: string;
    #variableId: NodeEntryId;
    #variableKey: string;

    constructor(blueprint: Blueprint, data: NodeData) {
        super(blueprint, data);

        this.#variableId = data.inputs.input.ids![0];
        const { nodeId, key } = segmentEntryId(this.#variableId);

        this.#nodeId = nodeId;
        this.#variableKey = key;
    }

    get nodeId(): string {
        return this.#nodeId;
    }

    get variableKey(): string {
        return this.#variableKey;
    }

    get variableId(): NodeEntryId {
        return this.#variableId;
    }
}

export { VariableBlueprintNode };
