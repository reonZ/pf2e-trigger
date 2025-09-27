import { TriggerHook } from "hook";
import {
    ActorPF2e,
    ChatContextFlag,
    ChatMessagePF2e,
    createHook,
    degreeOfSuccessNumber,
    isValidTargetDocuments,
    ItemOriginFlag,
    ItemPF2e,
    R,
    tupleHasValue,
    ZeroToThree,
} from "module-helpers";

const ATTACK_OPTIONS = ["action", "item", "options", "other", "outcome"] as const;
const DAMAGE_OPTIONS = ["heal", "item", "negated", "options", "other"] as const;

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
        if (!context || !tupleHasValue(this.events, context.type)) return;

        const originActor = await getOriginActor(origin, context);
        if (!originActor) return;

        const item = await getOriginItem(originActor, origin, context);

        if (context.type === "damage-taken") {
            const target = { actor: message.actor, token: message.token };
            const source = { actor: originActor };
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
                    action: (context as { action?: string }).action ?? "",
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

function getRollOptionValue(context: ChatContextFlag, prefix: string): string | undefined {
    return context.options?.find((option) => option.startsWith(prefix))?.slice(prefix.length);
}

const ITEM_ID_PREFIX = "item:id:";
async function getOriginItem(
    actor: ActorPF2e,
    origin: Maybe<ItemOriginFlag>,
    context: ChatContextFlag
): Promise<ItemPF2e | null> {
    if (origin?.uuid) {
        return fromUuid<ItemPF2e>(origin.uuid);
    }

    const itemId = getRollOptionValue(context, ITEM_ID_PREFIX);
    if (!itemId) return null;

    return actor.system.actions?.find((action) => action.item.id === itemId)?.item ?? null;
}

const SIGNATURE_PREFIX = "origin:signature:";
const _cachedActors: Record<string, ActorPF2e | null> = {};
async function getOriginActor(
    origin: Maybe<ItemOriginFlag>,
    context: ChatContextFlag
): Promise<ActorPF2e | null> {
    if (origin?.actor) {
        return fromUuid<ActorPF2e>(origin.actor);
    }

    const signature = getRollOptionValue(context, SIGNATURE_PREFIX);
    if (!signature) return null;

    const cached = _cachedActors[signature];
    if (cached !== undefined) {
        return cached;
    }

    const actor = game.actors.find((actor) => actor.signature === signature);
    return (_cachedActors[signature] = actor ?? null);
}

type AttackTriggerOptions = {
    action: string;
    item?: ItemPF2e | null;
    options: string[];
    other: TargetDocuments;
    outcome: ZeroToThree;
};

type DamageTriggerOptions = {
    heal: boolean;
    item?: ItemPF2e | null;
    negated: boolean;
    options: string[];
    other: TargetDocuments;
};

export { ATTACK_OPTIONS, DAMAGE_OPTIONS, MessageHook };
export type { AttackTriggerOptions, DamageTriggerOptions };
