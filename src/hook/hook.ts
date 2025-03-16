import { MODULE, R } from "module-helpers";
import { Trigger } from "trigger/trigger";

abstract class TriggerHook {
    #active: Set<NodeEventKey> = new Set();
    #triggers: TriggerData[] = [];

    abstract get events(): NodeEventKey[];
    protected abstract _activate(): void;
    protected abstract _disable(): void;

    get activeEvents(): Set<NodeEventKey> {
        return this.#active;
    }

    getTrigger(id: string): TriggerData | undefined {
        return this.#triggers.find((trigger) => trigger.id === id);
    }

    initialize(triggers: TriggerData[]) {
        this.#triggers.length = 0;
        this.#active.clear();

        const events = this.events;
        const conditions = this.conditions;

        triggerLoop: for (const trigger of triggers) {
            const triggerEventKey = trigger.event.key as NodeEventKey;

            if (events?.includes(triggerEventKey)) {
                this.#triggers.push(trigger);
                this.#active.add(triggerEventKey);
                continue;
            }

            if (!conditions) continue;

            for (const node of R.values(trigger.nodes)) {
                if (
                    node.type === "condition" &&
                    conditions.includes(node.key as NodeConditionKey)
                ) {
                    this.#active.add(triggerEventKey);
                    continue triggerLoop;
                }
            }
        }

        if (this.#active.size) {
            MODULE.debug("activate", this.constructor.name);

            if (game.user.isGM) {
                this._activate();
            }

            this._activateAll?.();
        } else {
            MODULE.debug("disable", this.constructor.name);

            if (game.user.isGM) {
                this._disable();
            }

            this._disableAll?.();
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
    _activateAll(): void;
    _disableAll(): void;
}

export { TriggerHook };
