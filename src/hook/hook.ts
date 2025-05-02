import { TriggerData } from "data";
import { MODULE, userIsGM } from "module-helpers";
import { NodeEventKey, NodeKey, NonEventKey } from "schema";
import { Trigger, TriggerPreOptions } from "trigger";

abstract class TriggerHook {
    #triggers = new Collection<TriggerData>();

    abstract get events(): NodeEventKey[];
    abstract activate(): void;
    abstract disable(): void;

    get nodes(): NonEventKey[] {
        return [];
    }
    activateAll() {}
    disableAll() {}

    initialize(triggers: TriggerData[], subtriggers: TriggerData[]) {
        this.#triggers.clear();

        const isGM = userIsGM();
        const nodeKeys: NodeKey[] = this.nodes;
        const eventKeys = this.events;

        trigger: for (const trigger of triggers) {
            if (eventKeys.includes(trigger.event.key)) {
                this.#triggers.set(trigger.id, trigger);
                break trigger;
            }

            if (nodeKeys.length) {
                for (const node of trigger.nodes) {
                    if (nodeKeys.includes(node.key)) {
                        this.#triggers.set(trigger.id, trigger);
                        break trigger;
                    }
                }
            }
        }

        let active = this.#triggers.size > 0;

        subtrigger: if (!active && nodeKeys.length) {
            for (const trigger of subtriggers) {
                for (const node of trigger.nodes) {
                    if (nodeKeys.includes(node.key)) {
                        active = true;
                        break subtrigger;
                    }
                }
            }
        }

        if (active) {
            MODULE.debug(this.constructor.name, "active");
            if (isGM) {
                this.activate();
            }
            this.activateAll();
        } else {
            MODULE.debug(this.constructor.name, "disabled");
            if (isGM) {
                this.disable();
            }
            this.disableAll();
        }
    }

    async executeTriggers(options: TriggerPreOptions, event?: this["events"][number]) {
        for (const data of this.#triggers) {
            if (event && data.event.key !== event) continue;

            const trigger = new Trigger(data, options);
            await trigger.execute();
        }
    }
}

export { TriggerHook };
