import { BlueprintNode } from "../blueprint-node";

abstract class SplitterBlueprintNode extends BlueprintNode {
    get subtitle(): string | null {
        return null;
    }

    get headerColor(): number {
        return 0x7e18b5;
    }

    get icon(): string {
        return "\ue254";
    }
}

export { SplitterBlueprintNode };
