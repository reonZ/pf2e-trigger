import { TriggerHook } from "hook";
import {
    ActorPF2e,
    ChatMessagePF2e,
    createHook,
    isValidTargetDocuments,
    ItemPF2e,
    R,
} from "module-helpers";

class MessageHook extends TriggerHook {
    #createMessageHook = createHook("createChatMessage", this.#onCreateMessage.bind(this));

    get events(): ["damage-taken"] {
        return ["damage-taken"];
    }

    activate(): void {
        this.#createMessageHook.activate();
    }

    disable(): void {
        this.#createMessageHook.disable();
    }

    async #onCreateMessage(message: ChatMessagePF2e) {
        if (!game.user.isActiveGM) return;

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

        this.executeTriggers<DamageTriggerOptions>(
            {
                heal: !!appliedDamage?.isHealing,
                item,
                options: context?.options ?? [],
                negated: appliedDamage == null,
                other: source,
                this: target,
            },
            "damage-taken"
        );
    }
}

const DAMAGE_OPTIONS = ["heal", "item", "negated", "options", "other"] as const;

type DamageTriggerOptions = {
    heal: boolean;
    item: ItemPF2e;
    negated: boolean;
    options: string[];
    other: TargetDocuments;
};

export { DAMAGE_OPTIONS, MessageHook };
export type { DamageTriggerOptions };
