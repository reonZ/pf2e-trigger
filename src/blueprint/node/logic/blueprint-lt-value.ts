import { LogicBlueprintNode } from "./blueprint-logic-node";

class LtValueBlueprintNode extends LogicBlueprintNode {
    get filigram(): string {
        return "\x3c";
    }
}

export { LtValueBlueprintNode };
