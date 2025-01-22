import { EventBlueprintNode } from "./blueprint-event-node";

abstract class TokenEventBlueprintNode extends EventBlueprintNode {}

class CreateTokenBlueprintNode extends TokenEventBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf2bd", { fontWeight: "900" });
    }
}

class DeleteTokenBlueprintNode extends TokenEventBlueprintNode {
    get icon(): string {
        return "\uf2bd";
    }
}

export { CreateTokenBlueprintNode, DeleteTokenBlueprintNode };
