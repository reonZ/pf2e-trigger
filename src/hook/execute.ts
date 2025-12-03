import { TriggerHook } from "hook";
import {
    ActorPF2e,
    convertTargetFromPacket,
    convertToCallOptions,
    convertToEmitOptions,
    EmitablePacket,
    isValidTargetDocuments,
    MODULE,
    R,
} from "module-helpers";

class ExecuteHook extends TriggerHook {
    get eventKeys(): ["execute-event"] {
        return ["execute-event"];
    }

    activateAll(): void {
        foundry.utils.setProperty(game, "trigger.execute", this.#executeEvent.bind(this));
    }

    disableAll(): void {
        foundry.utils.setProperty(game, "trigger.execute", () => {});
    }

    #executeEvent(actorOrTarget: Maybe<ActorPF2e | TargetDocuments>, values?: unknown[]) {
        const target =
            actorOrTarget instanceof Actor
                ? { actor: actorOrTarget }
                : isValidTargetDocuments(actorOrTarget)
                ? actorOrTarget
                : undefined;

        if (!this.isValidActor(target?.actor)) return;

        values = R.isArray(values) ? values : [];

        if (game.user.isActiveGM) {
            return this.executeTriggers({ this: target, values });
        }

        const data: UserQueryExecuteData = {
            action: "execute-event",
            target: { actor: target.actor.uuid, token: target.token?.uuid },
            values: convertToEmitOptions(values),
        };

        game.users.activeGM?.query(MODULE.path("user-query"), data);
    }
}

async function executeEvent(data: UserQueryExecuteData) {
    const target = await convertTargetFromPacket(data.target);

    if (!isValidTargetDocuments(target)) return;

    const values = await convertToCallOptions(data.values);

    game.trigger?.execute(target, values);
}

type UserQueryExecuteData = {
    action: "execute-event";
    target: { actor: ActorUUID; token?: TokenDocumentUUID };
    values: EmitablePacket<unknown[]>;
};

export { executeEvent, ExecuteHook };
export type { UserQueryExecuteData };
