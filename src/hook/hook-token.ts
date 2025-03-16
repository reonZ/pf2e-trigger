import { TriggerHook } from "hook/hook";
import { TokenDocumentPF2e } from "module-helpers";

class TokenHook extends TriggerHook<"token-create" | "token-delete"> {
    #createTokenHook = this.createEventHook("createToken", this.#onCreateToken.bind(this));
    #deleteTokenHook = this.createEventHook("deleteToken", this.#onDeleteToken.bind(this));

    get events(): ["token-create", "token-delete"] {
        return ["token-create", "token-delete"];
    }

    protected _activate(): void {
        this.#createTokenHook.toggle("token-create");
        this.#deleteTokenHook.toggle("token-delete");
    }

    protected _disable(): void {
        this.#createTokenHook.disable();
        this.#deleteTokenHook.disable();
    }

    #onCreateToken(token: TokenDocumentPF2e) {
        const options = this.createHookOptions(token.actor, token);
        if (!options) return;

        this.executeEventTriggers("token-create", options);
    }

    #onDeleteToken(token: TokenDocumentPF2e) {
        const options = this.createHookOptions(token.actor, token);
        if (!options) return;

        this.executeEventTriggers("token-delete", options);
    }
}

export { TokenHook };
