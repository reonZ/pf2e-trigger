import { ActorPF2e, localize } from "module-helpers";
import { Trigger, TriggerInputEntry, TriggerRunCache, TriggerRunOptions } from "../trigger";

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

    abstract test(
        target: TargetDocuments,
        trigger: Trigger,
        options: TriggerRunOptions,
        cache: TriggerRunCache
    ): Promisable<boolean>;

    abstract getOrigin(
        target: TargetDocuments,
        trigger: Trigger,
        options: TriggerRunOptions
    ): TargetDocuments | undefined;

    testCondition<TCondition extends Maybe<any>>(
        condition: TCondition,
        testFunction: (condition: NonNullable<TCondition>) => boolean
    ) {
        if (condition == null) return true;
        return testFunction(condition);
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

    label(trigger: Trigger): string {
        return localize("events", this.id);
    }
}

type TriggerRunCacheBase = {
    hasItem: Record<string, boolean>;
};

export { TriggerEvent };
export type { TriggerRunCacheBase };
