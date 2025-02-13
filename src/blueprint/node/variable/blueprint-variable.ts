import { Blueprint } from "blueprint/blueprint";
import { BlueprintNode } from "../blueprint-node";
import { segmentEntryId } from "data/data-entry";

class VariableBlueprintNode extends BlueprintNode {
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

    get context(): string[] {
        return ["delete-node", "remove-variable"];
    }

    get variableId(): NodeEntryId {
        return this.#variableId;
    }

    protected async _onContext(context: string): Promise<void> {
        switch (context) {
            case "remove-variable": {
                return this.#deleteVariable();
            }

            default: {
                return super._onContext(context);
            }
        }
    }

    #deleteVariable() {
        const entry = this.blueprint.getEntry(this.variableId);
        if (!entry) return;

        this.blueprint.removeVariable(entry);
    }
}

export { VariableBlueprintNode };
