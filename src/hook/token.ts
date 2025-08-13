import { TriggerHook } from "hook";
import { TokenDocumentPF2e } from "module-helpers";

class TokenHook extends TriggerHook {
    #createTokenHook = this.createEventHook("createToken", this.#onCreateToken.bind(this));
    #deleteTokenHook = this.createEventHook("deleteToken", this.#onDeleteToken.bind(this));
    #moveTokenHook = this.createEventHook("moveToken", this.#onMoveToken.bind(this));

    get events(): ["token-create", "token-delete", "token-moved"] {
        return ["token-create", "token-delete", "token-moved"];
    }

    activate(): void {
        this.#createTokenHook.toggle("token-create");
        this.#deleteTokenHook.toggle("token-delete");
        this.#moveTokenHook.toggle("token-moved");
    }

    disable(): void {
        this.#createTokenHook.disable();
        this.#deleteTokenHook.disable();
        this.#moveTokenHook.disable();
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

    #onMoveToken(token: TokenDocumentPF2e, data: Record<string, any>) {
        const actor = token.actor;

        if (this.isValidEvent(actor)) {
            this.executeTriggers<TokenMovedTriggerOptions>(
                {
                    this: { actor, token },
                    data: foundry.utils.deepClone(data),
                },
                "token-moved"
            );
        }
    }
}

type TokenMovedTriggerOptions = {
    data: Record<string, any>;
};

export { TokenHook };
export type { TokenMovedTriggerOptions };
