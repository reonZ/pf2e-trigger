import { BlueprintNode } from "../blueprint-node";

class ConverterBlueprintNode extends BlueprintNode {
    get title(): string | null {
        return null;
    }

    get entriesSpacing(): number {
        return 5;
    }

    get context(): string[] {
        return ["delete"];
    }
}

export { ConverterBlueprintNode };
