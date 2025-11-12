import { TriggerHook } from "hook";
import { ActorPF2e, isValidTargetDocuments } from "module-helpers";

class ExecuteHook extends TriggerHook {
    get eventKeys(): ["execute-event"] {
        return ["execute-event"];
    }

    activate(): void {
        foundry.utils.setProperty(game, "trigger.execute", this.#executeEvent.bind(this));
    }

    disable(): void {
        foundry.utils.setProperty(game, "trigger.execute", () => {});
    }

    #executeEvent(actorOrTarget: Maybe<ActorPF2e | TargetDocuments>, values: unknown) {
        const target =
            actorOrTarget instanceof Actor
                ? { actor: actorOrTarget }
                : isValidTargetDocuments(actorOrTarget)
                ? actorOrTarget
                : undefined;

        if (!this.isValidEventActor(target?.actor)) return;

        this.executeTriggers({ this: target, values });
    }
}

export { ExecuteHook };
