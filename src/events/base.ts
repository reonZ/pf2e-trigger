import {
    getActiveModule,
    isInstanceOf,
    localize,
    R,
    rollDamageFromFormula,
    SAVE_TYPES,
} from "foundry-pf2e";
import { TriggerActionOptions } from "../action";
import {
    RunTriggerArgs,
    RunTriggerOptions,
    Trigger,
    TriggerInputEntry,
    TriggerInputValueType,
} from "../trigger";

abstract class TriggerEvent {
    #enabled = false;

    abstract get id(): string;
    abstract get conditions(): Readonly<TriggerInputEntry[]>;
    abstract get icon(): string;

    get enabled() {
        return this.#enabled;
    }

    _enable(enabled: boolean, triggers: Trigger[]): void {
        this.#enabled = enabled;
    }

    static testCondition<TCondition extends Maybe<any>>(
        condition: TCondition,
        testFunction: (condition: NonNullable<TCondition>) => boolean
    ) {
        if (condition == null) return true;
        return testFunction(condition);
    }

    static actorsRespectAlliance(
        origin: ActorPF2e,
        target: ActorPF2e,
        alliance: "all" | "allies" | "enemies" = "all"
    ) {
        return alliance === "all"
            ? true
            : alliance === "allies"
            ? target.isAllyOf(origin)
            : target.isEnemyOf(origin);
    }

    abstract test(
        actor: ActorPF2e,
        trigger: Trigger,
        options: RunTriggerOptions
    ): Promisable<boolean>;

    label(trigger: Trigger): string {
        return localize("events", this.id);
    }

    abstract getRollDamageOrigin(
        args: RunTriggerArgs<Trigger, "rollDamage">
    ): TargetDocuments | undefined;

    async rollDamage(args: RunTriggerArgs<Trigger, "rollDamage">): Promise<boolean> {
        const { actionOptions, actor, options } = args;
        if (!R.isString(actionOptions.formula) || !R.isString(actionOptions.item)) return false;

        const item = await fromUuid(actionOptions.item);
        if (!isInstanceOf(item, "ItemPF2e")) return false;

        const target = resolveTarget({ actor, token: options.token });
        await rollDamageFromFormula(actionOptions.formula, {
            item,
            target,
            origin: actionOptions.self ? target : this.getRollDamageOrigin(args),
        });

        return true;
    }

    async rollSave({
        linkOption,
        actionOptions,
        actor,
    }: RunTriggerArgs<Trigger, "rollSave">): Promise<boolean> {
        const threshold = Number(linkOption);

        if (!SAVE_TYPES.includes(actionOptions.save)) return false;

        const actorSave = actor.saves?.[actionOptions.save];
        if (!actorSave) return false;

        const roll = await actorSave.roll({ dc: actionOptions.dc });
        if (!roll) return false;

        return isNaN(threshold) ? true : (roll.degreeOfSuccess ?? 2) >= threshold;
    }
}

function resolveTarget(
    target: TargetDocuments | undefined,
    uuids: true
): { actor: string; token?: string } | undefined;
function resolveTarget(
    target: TargetDocuments | undefined,
    uuids?: false
): TargetDocuments | undefined;
function resolveTarget(
    target: TargetDocuments | undefined,
    uuids?: boolean
): TargetDocuments | { actor: string; token?: string } | undefined {
    if (!target) return;

    const actor = target.actor;
    const token =
        target.token ??
        ((getActiveModule("pf2e-toolbelt")?.getSetting("targetHelper.enabled") &&
            target.actor.getActiveTokens(true, true).at(0)) ||
            undefined);

    return uuids ? { actor: actor.uuid, token: token?.uuid } : { actor, token };
}

export { TriggerEvent, resolveTarget };
