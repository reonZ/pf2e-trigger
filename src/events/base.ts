import { getActiveModule, isInstanceOf, localize, R, rollDamageFromFormula } from "foundry-pf2e";
import { TriggerActionOptions } from "../action";
import { Trigger, TriggerInputEntry, TriggerInputValueType } from "../trigger";

abstract class TriggerEvent {
    #enabled = false;

    abstract get id(): string;
    abstract get conditions(): Readonly<TriggerInputEntry[]>;
    abstract get icon(): string;

    get enabled() {
        return this.#enabled;
    }

    _enable(enabled: boolean): void {
        this.#enabled = enabled;
    }

    abstract test(
        actor: ActorPF2e,
        conditions: Trigger["conditions"],
        options?: Record<string, any>
    ): Promisable<boolean>;

    createLabel(trigger: Trigger): string {
        return localize("events", this.id);
    }

    actorsRespectAlliance(
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

    testCondition<TCondition extends Maybe<any>>(
        condition: TCondition,
        testFunction: (condition: NonNullable<TCondition>) => boolean
    ) {
        if (condition == null) return true;
        return testFunction(condition);
    }

    async rollDamage(
        actor: ActorPF2e,
        actionOptions: TriggerActionOptions<"rollDamage">,
        linkOption: TriggerInputValueType,
        {
            origin,
            target,
        }: {
            origin: TargetDocuments;
            target?: TargetDocuments;
        }
    ): Promise<boolean> {
        if (!actionOptions || !R.isString(actionOptions.formula) || !R.isString(actionOptions.item))
            return false;

        const item = await fromUuid(actionOptions.item);
        if (!isInstanceOf(item, "ItemPF2e")) return false;

        await rollDamageFromFormula(origin.actor, actionOptions.formula, {
            item,
            target: resolveTarget(target, true),
        });

        return true;
    }

    async rollSave(
        actor: ActorPF2e,
        actionOptions: TriggerActionOptions<"rollSave">,
        linkOption: TriggerInputValueType,
        options: {}
    ): Promise<boolean> {
        const threshold = Number(linkOption);

        ChatMessage.create({ content: "This is a save check message:<br>Failure" });
        const success = 0;
        return isNaN(threshold) ? true : success >= threshold;
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

export { TriggerEvent };
