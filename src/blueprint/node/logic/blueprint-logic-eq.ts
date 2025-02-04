import { LogicBlueprintNode } from "./blueprint-logic";

class EqValueBlueprintNode extends LogicBlueprintNode {
    get icon(): string {
        return "\x3d";
    }
}

export { EqValueBlueprintNode };
