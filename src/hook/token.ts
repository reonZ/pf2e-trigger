import { TriggerHook } from "hook";
import { TokenDocumentPF2e } from "module-helpers";

class TokenHook extends TriggerHook {
    #createTokenHook = this.createEventHook("createToken", this.#onCreateToken.bind(this));
    #deleteTokenHook = this.createEventHook("deleteToken", this.#onDeleteToken.bind(this));

    get events(): ["token-create", "token-delete"] {
        return ["token-create", "token-delete"];
    }

    activate(): void {
        this.#createTokenHook.toggle("token-create");
        this.#deleteTokenHook.toggle("token-delete");
    }

    disable(): void {
        this.#createTokenHook.disable();
        this.#deleteTokenHook.disable();
    }

    #onCreateToken(token: TokenDocumentPF2e) {
        const actor = token.actor;

        if (this.isValidEvent(actor)) {
            this.executeTriggers({ this: { actor, token } }, "token-create");
        }
    }

    #onDeleteToken(token: TokenDocumentPF2e) {
        const actor = token.actor;

        if (this.isValidEvent(actor)) {
            this.executeTriggers({ this: { actor, token } }, "token-delete");
        }
    }
}

export { TokenHook };
