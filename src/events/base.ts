import { localize } from "foundry-pf2e";
import { Trigger, TriggerInputEntry, TriggerRunOptions } from "../trigger";

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
        options: TriggerRunOptions
    ): Promisable<boolean>;

    abstract getOrigin(
        actor: ActorPF2e,
        trigger: Trigger,
        options: TriggerRunOptions
    ): TargetDocuments | undefined;

    label(trigger: Trigger): string {
        return localize("events", this.id);
    }
}

export { TriggerEvent };
