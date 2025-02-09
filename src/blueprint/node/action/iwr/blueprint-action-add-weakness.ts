import { AddIwrBlueprintNode } from "./blueprint-action-add-iwr";

class AddWeaknessBlueprintNode extends AddIwrBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\ue06c", { fontWeight: "900" });
    }

    get iwrConfig(): IwrConfig {
        return "CONFIG.PF2E.weaknessTypes";
    }
}

export { AddWeaknessBlueprintNode };
