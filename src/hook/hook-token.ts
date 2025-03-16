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
        const actor = token.actor;
        if (!this.isValidHookEvent(actor)) return;

        this.executeEventTriggers("token-create", {
            this: { actor, token },
        });
    }

    #onDeleteToken(token: TokenDocumentPF2e) {
        const actor = token.actor;
        if (!this.isValidHookEvent(actor)) return;

        this.executeEventTriggers("token-delete", {
            this: { actor, token },
        });
    }
}

export { TokenHook };
