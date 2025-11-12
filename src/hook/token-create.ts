import { TriggerHook } from "hook";
import { TokenDocumentPF2e } from "module-helpers";

class TokenCreateHook extends TriggerHook {
    #createTokenHook = this.createEventHook("createToken", this.#onCreateToken.bind(this));

    get events(): ["token-create"] {
        return ["token-create"];
    }

    activate(): void {
        this.#createTokenHook.activate();
    }

    disable(): void {
        this.#createTokenHook.disable();
    }

    #onCreateToken(token: TokenDocumentPF2e) {
        const actor = token.actor;

        if (this.isValidEventActor(actor)) {
            this.executeTriggers({ this: { actor, token } });
        }
    }
}

export { TokenCreateHook };
