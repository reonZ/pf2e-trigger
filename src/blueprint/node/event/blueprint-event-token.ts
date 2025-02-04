import { EventBlueprintNode } from "./blueprint-event";

class CreateTokenBlueprintNode extends EventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf2bd", { fontWeight: "900" });
    }
}

class DeleteTokenBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf2bd";
    }
}

export { CreateTokenBlueprintNode, DeleteTokenBlueprintNode };
