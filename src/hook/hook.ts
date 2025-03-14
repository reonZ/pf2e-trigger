import { MODULE, R } from "module-helpers";
import { Trigger } from "trigger/trigger";

abstract class TriggerHook {
    #triggers: TriggerData[] = [];

    abstract get events(): NodeEventKey[];
    protected abstract _activate(): void;
    protected abstract _disable(): void;

    getTrigger(id: string): TriggerData | undefined {
        return this.#triggers.find((trigger) => trigger.id === id);
    }

    initialize(triggers: TriggerData[]) {
        this.#triggers.length = 0;

        const events = this.events;
        const conditions = this.conditions;

        let active = false;

        triggerLoop: for (const trigger of triggers) {
            if (events?.includes(trigger.event.key as NodeEventKey)) {
                this.#triggers.push(trigger);
                active = true;
                continue;
            }

            if (active || !conditions) continue;

            for (const node of R.values(trigger.nodes)) {
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

    async executeTriggers(options: PreTriggerExecuteOptions) {
        for (const data of this.#triggers) {
            await this.executeTrigger(data, options);
        }
    }

    async executeEventTriggers(event: NodeEventKey, options: PreTriggerExecuteOptions) {
        for (const data of this.#triggers) {
            if (data.event.key !== event) continue;
            await this.executeTrigger(data, options);
        }
    }

    async executeTrigger(data: TriggerData, options: PreTriggerExecuteOptions) {
        const trigger = new Trigger(data);
        const auras = await trigger.insideAura?.getActorAuras(options.this.actor);

        if (auras?.length) {
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

interface TriggerHook {
    get conditions(): NodeConditionKey[] | undefined;
}

export { TriggerHook };
