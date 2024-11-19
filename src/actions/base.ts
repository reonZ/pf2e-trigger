import {
    Trigger,
    TriggerAction,
    TriggerInputEntry,
    TriggerInputValueType,
    TriggerRunOptions,
} from "../trigger";

abstract class TriggerEventAction {
    abstract get type(): string;
    abstract get icon(): string;
    abstract get options(): Readonly<TriggerInputEntry[]>;

    abstract execute(
        actor: ActorPF2e,
        trigger: Trigger,
        action: TriggerAction,
        linkOption: TriggerInputValueType,
        options: TriggerRunOptions
    ): Promisable<boolean>;
}

interface TriggerEventAction {
    get linkOption(): TriggerInputEntry | undefined;
}

export { TriggerEventAction };