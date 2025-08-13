import { TriggerHook } from "hook";
import {
    ChatMessagePF2e,
    CheckContextChatFlag,
    createHook,
    degreeOfSuccessNumber,
    isValidTargetDocuments,
    ItemPF2e,
    R,
    tupleHasValue,
    ZeroToThree,
} from "module-helpers";

class MessageHook extends TriggerHook {
    #createMessageHook = createHook("createChatMessage", this.#onCreateMessage.bind(this));

    get events(): ["attack-roll", "damage-taken"] {
        return ["attack-roll", "damage-taken"];
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
        if (!context || !origin?.actor || !tupleHasValue(this.events, context.type)) return;

        const item = await fromUuid<ItemPF2e>(origin.uuid);
        if (!(item instanceof Item)) return;

        if (context.type === "damage-taken") {
            const target = { actor: message.actor, token: message.token };
            const source = { actor: await fromUuid(origin.actor) };
            if (!isValidTargetDocuments(target) || !isValidTargetDocuments(source)) return;

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
        } else if (context.type === "attack-roll") {
            if (!context.target || !context.outcome) return;

            const outcome = degreeOfSuccessNumber(context.outcome);
            if (R.isNullish(outcome)) return;

            const source = { actor: message.actor, token: message.token };
            const target = {
                actor: await fromUuid(context.target.actor),
                token: context.target.token ? await fromUuid(context.target.token) : undefined,
            };
            if (!isValidTargetDocuments(target) || !isValidTargetDocuments(source)) return;

            this.executeTriggers<AttackTriggerOptions>(
                {
                    action: (context as CheckContextChatFlag & { action: string }).action ?? "",
                    item,
                    options: context?.options ?? [],
                    other: target,
                    outcome,
                    this: source,
                },
                "attack-roll"
            );
        }
    }
}

const ATTACK_OPTIONS = ["action", "item", "options", "other", "outcome"] as const;
const DAMAGE_OPTIONS = ["heal", "item", "negated", "options", "other"] as const;

type AttackTriggerOptions = {
    action: string;
    item: ItemPF2e;
    options: string[];
    other: TargetDocuments;
    outcome: ZeroToThree;
};

type DamageTriggerOptions = {
    heal: boolean;
    item: ItemPF2e;
    negated: boolean;
    options: string[];
    other: TargetDocuments;
};

export { ATTACK_OPTIONS, DAMAGE_OPTIONS, MessageHook };
export type { AttackTriggerOptions, DamageTriggerOptions };
