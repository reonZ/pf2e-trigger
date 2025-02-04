import { LogicBlueprintNode } from "./blueprint-logic";

class LtValueBlueprintNode extends LogicBlueprintNode {
    get icon(): string {
        return "\x3c";
    }
}

export { LtValueBlueprintNode };
