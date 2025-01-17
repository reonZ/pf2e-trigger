import { LogicBlueprintNode } from "./blueprint-logic-node";

class GtValueBlueprintNode extends LogicBlueprintNode {
    get filigram(): string {
        return "\x3e";
    }
}

export { GtValueBlueprintNode };
