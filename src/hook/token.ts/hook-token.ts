import { TriggerHook } from "hook/hook";
import { Hook, TokenDocumentPF2e, createHook, userIsActiveGM } from "module-helpers";

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

    #onHook(token: TokenDocumentPF2e, data: object, userId: string) {
        if (!userIsActiveGM()) return;

        const actor = token.actor;
        if (!actor) return;

        this.executeTriggers({ this: { actor, token } });
    }
}

export { TokenHook };
