import { TriggerHook } from "hook/hook";
import {
    ActorPF2e,
    ActorSourcePF2e,
    ActorUpdateOperation,
    Hook,
    TokenDocumentPF2e,
    createHook,
    userIsActiveGM,
} from "module-helpers";

abstract class ActorHook extends TriggerHook {
    #hook: Hook;

    constructor(event: "updateActor") {
        super();
        this.#hook = createHook(event, this.#onHook.bind(this));
    }

    abstract _onHook(
        options: PreTriggerExecuteOptions,
        data: DeepPartial<ActorSourcePF2e>,
        operation: ActorUpdateOperation<TokenDocumentPF2e>
    ): Promise<boolean>;

    protected _activate(): void {
        this.#hook.activate();
    }

    protected _disable(): void {
        this.#hook.disable();
    }

    async #onHook(
        actor: ActorPF2e,
        data: DeepPartial<ActorSourcePF2e>,
        operation: ActorUpdateOperation<TokenDocumentPF2e>,
        userId: string
    ) {
        if (!userIsActiveGM()) return;

        const options: PreTriggerExecuteOptions = {
            this: { actor },
        };

        const proceed = await this._onHook(options, data, operation);
        if (!proceed) return;

        this.executeTriggers(options);
    }
}

export { ActorHook };
