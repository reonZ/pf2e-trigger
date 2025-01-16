import { TriggerData } from "@data/data-trigger";
import { NodeConditionKey, NodeEventKey } from "@schema/schema-list";
import { Trigger, TriggerExecuteOptions } from "@trigger/trigger";
import { MODULE, R } from "module-helpers";

abstract class TriggerHook {
    #triggersData: TriggerData[] = [];

    protected abstract _activate(): void;
    protected abstract _disable(): void;

    initialize(triggers: TriggerData[]) {
        this.#triggersData.length = 0;

        const events = this.events;
        const conditions = this.conditions;

        triggerLoop: for (const trigger of triggers) {
            if (events?.includes(trigger.event.key as NodeEventKey)) {
                this.#triggersData.push(trigger);
                continue;
            }

            if (!conditions) continue;

            for (const node of R.values(trigger.nodes)) {
                if (
                    node.type === "condition" &&
                    conditions.includes(node.key as NodeConditionKey)
                ) {
                    this.#triggersData.push(trigger);
                    continue triggerLoop;
                }
            }
        }

        if (this.#triggersData.length) {
            MODULE.debug("activate", this.constructor.name);
            this._activate();
        } else {
            MODULE.debug("disable", this.constructor.name);
            this._disable();
        }
    }

    protected _executeTriggers(options: TriggerExecuteOptions) {
        for (const data of this.#triggersData) {
            const trigger = new Trigger(data);
            trigger.execute(options);
        }
    }
}

interface TriggerHook {
    get events(): NodeEventKey[] | undefined;
    get conditions(): NodeConditionKey[] | undefined;
}

export { TriggerHook };
