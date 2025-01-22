import { Hook, TokenDocumentPF2e, createHook, userIsActiveGM } from "module-helpers";
import { TriggerHook } from "./trigger-hook";
import { NodeEventKey } from "schema/schema-list";

abstract class TokenHook extends TriggerHook {
    #hook: Hook;

    constructor(event: "createToken" | "deleteToken") {
        super();
        this.#hook = createHook(event, this.#onHook.bind(this));
    }

    protected _activate(): void {
        this.#hook.activate();
    }

    protected _disable(): void {
        this.#hook.disable();
    }

    #onHook(token: TokenDocumentPF2e, context: object, userId: string) {
        if (!userIsActiveGM()) return;

        const actor = token.actor;
        if (!actor) return;

        this._executeTriggers({ target: { actor, token } });
    }
}

class CreateTokenHook extends TokenHook {
    constructor() {
        super("createToken");
    }

    get events(): NodeEventKey[] {
        return ["token-create"];
    }
}

class DeleteTokenHook extends TokenHook {
    constructor() {
        super("deleteToken");
    }

    get events(): NodeEventKey[] {
        return ["token-delete"];
    }
}

export { CreateTokenHook, DeleteTokenHook };
