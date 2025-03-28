import {
    ActorPF2e,
    ChatMessagePF2e,
    ItemPF2e,
    R,
    createHook,
    isValidTargetDocuments,
    userIsActiveGM,
} from "module-helpers";
import { TriggerHook } from "./hook";

class MessageHook extends TriggerHook<"damage-taken" | "damage-dealt"> {
    #createMessageHook = createHook("createChatMessage", this.#onCreateMessage.bind(this));

    get events(): ["damage-taken", "damage-dealt"] {
        return ["damage-taken", "damage-dealt"];
    }

    protected _activate(): void {
        this.#createMessageHook.activate();
    }

    protected _disable(): void {
        this.#createMessageHook.disable();
    }

    async #onCreateMessage(message: ChatMessagePF2e) {
        if (!userIsActiveGM()) return;

        const { appliedDamage, origin, context } = message.flags.pf2e;
        if (
            !R.isPlainObject(context) ||
            context.type !== "damage-taken" ||
            !R.isPlainObject(origin) ||
            !origin.actor
        )
            return;

        const target = { actor: message.actor, token: message.token };
        const source = { actor: await fromUuid<ActorPF2e>(origin.actor) };
        if (!isValidTargetDocuments(target) || !isValidTargetDocuments(source)) return;

        const item = await fromUuid<ItemPF2e>(origin.uuid);
        if (!(item instanceof Item)) return;

        const negated = appliedDamage == null;
        const isHealing = !!appliedDamage?.isHealing;
        const list = context?.options ?? [];

        if (this.activeEvents.has("damage-taken")) {
            this.executeEventTriggers("damage-taken", {
                this: target,
                other: source,
                item,
                isHealing,
                negated,
                list,
            });
        }

        if (this.activeEvents.has("damage-dealt")) {
            this.executeEventTriggers("damage-dealt", {
                this: source,
                other: target,
                item,
                isHealing,
                negated,
                list,
            });
        }
    }
}

export { MessageHook };
