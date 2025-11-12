import { TriggerHook } from "hook";
import { TokenDocumentPF2e } from "module-helpers";

class TokenDeleteHook extends TriggerHook {
    #deleteTokenHook = this.createEventHook("deleteToken", this.#onDeleteToken.bind(this));

    get eventKeys(): ["token-delete"] {
        return ["token-delete"];
    }

    activate(): void {
        this.#deleteTokenHook.activate();
    }

    disable(): void {
        this.#deleteTokenHook.disable();
    }

    #onDeleteToken(token: TokenDocumentPF2e) {
        const actor = token.actor;

        if (this.isValidEventActor(actor)) {
            this.executeTriggers({ this: { actor, token } });
        }
    }
}

export { TokenDeleteHook };
