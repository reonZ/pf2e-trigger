import { LogicBlueprintNode } from "./blueprint-logic-node";

class EqBlueprintNode extends LogicBlueprintNode {
    get filigram(): string {
        return "\x3d";
    }
}

export { EqBlueprintNode };
