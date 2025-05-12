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

    get events(): ["damage-taken", "damage-dealt"] {
        return ["damage-taken", "damage-dealt"];
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

        const negated = appliedDamage == null;
        const heal = !!appliedDamage?.isHealing;
        const options = context?.options ?? [];

        this.executeTriggers<DamageTriggerOptions>(
            {
                heal,
                item,
                options,
                negated,
                other: source,
                this: target,
            },
            "damage-taken"
        );

        this.executeTriggers<DamageTriggerOptions>(
            {
                heal,
                item,
                options,
                negated,
                other: target,
                this: source,
            },
            "damage-dealt"
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
