import { MODULE, R } from "module-helpers";
import { NodeConditionKey, NodeEventKey } from "schema/schema-list";
import { Trigger, TriggersExecuteCallOptions } from "trigger/trigger";

abstract class TriggerHook {
    #triggers: Trigger[] = [];

    protected abstract _activate(): void;
    protected abstract _disable(): void;

    initialize(triggers: Trigger[]) {
        this.#triggers.length = 0;

        const events = this.events;
        const conditions = this.conditions;

        let active = false;

        triggerLoop: for (const trigger of triggers) {
            if (events?.includes(trigger.eventKey)) {
                this.#triggers.push(trigger);
                active = true;
                continue;
            }

            if (active || !conditions) continue;

            for (const node of trigger.nodes) {
                if (
                    node.type === "condition" &&
                    conditions.includes(node.key as NodeConditionKey)
                ) {
                    active = true;
                    continue triggerLoop;
                }
            }
        }

        if (active) {
            MODULE.debug("activate", this.constructor.name);
            this._activate();
        } else {
            MODULE.debug("disable", this.constructor.name);
            this._disable();
        }
    }

    protected async _executeTriggers(
        event: NodeEventKey,
        options: TriggersExecuteCallOptions
    ): Promise<void>;
    protected async _executeTriggers(options: TriggersExecuteCallOptions): Promise<void>;
    protected async _executeTriggers(
        arg0: NodeEventKey | TriggersExecuteCallOptions,
        arg1?: TriggersExecuteCallOptions
    ) {
        const [event, options] = R.isString(arg0)
            ? [arg0, arg1 as TriggersExecuteCallOptions]
            : [undefined, arg0];

        for (const trigger of this.#triggers) {
            if (event && trigger.eventKey !== event) continue;

            if (trigger.insideAura) {
                const auras = await trigger.insideAura.getActorAuras(options.this.actor);

                for (const aura of auras) {
                    await trigger.execute({
                        ...options,
                        aura,
                    });
                }
            } else {
                await trigger.execute(options);
            }
        }
    }
}

interface TriggerHook {
    get events(): NodeEventKey[] | undefined;
    get conditions(): NodeConditionKey[] | undefined;
}

export { TriggerHook };
