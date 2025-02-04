import { BlueprintNode } from "../blueprint-node";

class ConditionBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return 0x188600;
    }

    get icon() {
        return "\ue14f";
    }
}

export { ConditionBlueprintNode };
