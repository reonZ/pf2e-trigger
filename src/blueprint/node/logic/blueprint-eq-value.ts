import { LogicBlueprintNode } from "./blueprint-logic-node";

class EqValueBlueprintNode extends LogicBlueprintNode {
    get filigram(): string {
        return "\x3d";
    }
}

export { EqValueBlueprintNode };
