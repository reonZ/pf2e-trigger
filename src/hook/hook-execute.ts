import { TriggerHook } from "hook/hook";
import { MODULE, R, isInstanceOf, userIsActiveGM } from "module-helpers";

class ExecuteHook extends TriggerHook<"execute-event"> {
    get events(): ["execute-event"] {
        return ["execute-event"];
    }

    protected _activate(): void {
        game.trigger ??= {};
        game.trigger.execute = this.#runExecute.bind(this);
    }

    protected _disable(): void {
        game.trigger ??= {};
        game.trigger.execute = async () => {};
    }

    async #runExecute(id: string, target: TargetDocuments, values?: any) {
        if (!userIsActiveGM()) return;

        if (!R.isString(id)) {
            MODULE.error(`trigger ID is invalid.`);
            return;
        }

        if (!R.isPlainObject(target) || !isInstanceOf(target.actor, "ActorPF2e")) {
            MODULE.error(`target of execute trigger '${id}' is invalid.`);
            return;
        }

        const trigger = this.getTrigger(id);
        if (!trigger) {
            MODULE.error(`the trigger '${id}' does not exist.`);
            return;
        }

        this.executeTrigger(trigger, {
            this: target,
            values: R.isArray(values) ? values : [],
        });
    }
}

export { ExecuteHook };
