import { LogicBlueprintNode } from "./blueprint-logic";

class GtValueBlueprintNode extends LogicBlueprintNode {
    get icon(): string {
        return "\x3e";
    }
}

export { GtValueBlueprintNode };
