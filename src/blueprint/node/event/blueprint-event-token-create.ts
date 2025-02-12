import { EventBlueprintNode } from "./blueprint-event";

class CreateTokenBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf2bd", { fontWeight: "900" });
    }
}

export { CreateTokenBlueprintNode };
