import { BlueprintNode } from "../blueprint-node";

abstract class LogicBlueprintNode extends BlueprintNode {
    get subtitle(): string | null {
        return null;
    }

    get headerColor(): number {
        return 0x7e18b5;
    }
}

export { LogicBlueprintNode };
