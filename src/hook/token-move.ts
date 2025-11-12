import { TriggerHook } from "hook";
import { TokenDocumentPF2e } from "module-helpers";

class TokenMoveHook extends TriggerHook {
    #moveTokenHook = this.createEventHook("moveToken", this.#onMoveToken.bind(this));

    get eventKeys(): ["token-moved"] {
        return ["token-moved"];
    }

    activate(): void {
        this.#moveTokenHook.activate();
    }

    disable(): void {
        this.#moveTokenHook.disable();
    }

    #onMoveToken(token: TokenDocumentPF2e, data: Record<string, any>) {
        const actor = token.actor;

        if (this.isValidEventActor(actor)) {
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

export { TokenMoveHook };
export type { TokenMovedTriggerOptions };
