import { SimpleEventHook } from "hook";
import { TokenDocumentPF2e } from "module-helpers";

class TokenHook extends SimpleEventHook {
    _onEvent(token: TokenDocumentPF2e, data: Record<string, any>): void {
        const actor = token.actor;

        if (this.isValidEventActor(actor)) {
            this.executeTriggers({ this: { actor, token } });
        }
    }
}

class TokenMoveHook extends TokenHook {
    constructor() {
        super("moveToken", "token-moved");
    }

    _onEvent(token: TokenDocumentPF2e, data: Record<string, any>): void {
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

export { TokenHook, TokenMoveHook };
export type { TokenMovedTriggerOptions };
