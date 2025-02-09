import { AddIwrBlueprintNode } from "./blueprint-action-add-iwr";

class AddImmunityBlueprintNode extends AddIwrBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf644", { fontWeight: "900" });
    }

    get iwrConfig(): IwrConfig {
        return "CONFIG.PF2E.immunityTypes";
    }
}

export { AddImmunityBlueprintNode };
