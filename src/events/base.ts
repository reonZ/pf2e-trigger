import { getActiveModule, isInstanceOf, localize, R, rollDamageFromFormula } from "foundry-pf2e";
import { TriggerActions } from "../action";
import { Trigger, TriggerInputEntry } from "../trigger";

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
        trigger: Trigger,
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
        action: TriggerActions["rollDamage"],
        {
            origin,
            target,
        }: {
            origin: { actor: ActorPF2e };
            target?: { actor: ActorPF2e; token?: TokenDocumentPF2e };
        }
    ): Promise<boolean> {
        if (!action || !R.isString(action.formula) || !R.isString(action.item)) return false;

        const item = await fromUuid(action.item);
        if (!isInstanceOf(item, "ItemPF2e")) return false;

        await rollDamageFromFormula(origin.actor, action.formula, {
            item,
            target: resolveTarget(target, true),
        });

        return true;
    }
}

function resolveTarget(
    target: { actor: ActorPF2e; token?: TokenDocumentPF2e } | undefined,
    uuids: true
): { actor: string; token?: string } | undefined;
function resolveTarget(
    target: { actor: ActorPF2e; token?: TokenDocumentPF2e } | undefined,
    uuids?: false
): { actor: ActorPF2e; token?: TokenDocumentPF2e } | undefined;
function resolveTarget(
    target: { actor: ActorPF2e; token?: TokenDocumentPF2e } | undefined,
    uuids?: boolean
): { actor: ActorPF2e; token?: TokenDocumentPF2e } | { actor: string; token?: string } | undefined {
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
