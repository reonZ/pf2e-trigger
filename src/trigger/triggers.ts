import { MODULE } from "module-helpers";
import { Trigger, TriggerDataRaw, createTrigger } from "./trigger";

class TriggerCollection extends Collection<Trigger> {
    first(): Trigger {
        return this.values().next().value;
    }

    createEventTrigger({ event, name }: { event: string; name: string }): Trigger | null {
        const id = fu.randomID();
        const trigger = createTrigger({
            id,
            name: name.trim() || id,
            nodes: [
                {
                    id: fu.randomID(),
                    type: "event",
                    key: event,
                    x: 400,
                    y: 200,
                },
            ],
        });

        if (trigger) {
            this.set(trigger.id, trigger);
        }

        return trigger;
    }

    processTriggers() {
        // TODO use setting instead of that

        const hasItemId = fu.randomID();
        const itemSourceId = fu.randomID();

        const triggersData: Maybe<TriggerDataRaw>[] = [
            {
                id: fu.randomID(),
                name: "Test Trigger",
                nodes: [
                    {
                        id: fu.randomID(),
                        type: "event",
                        key: "turn-start",
                        x: 400,
                        y: 200,
                    },
                    {
                        id: hasItemId,
                        type: "condition",
                        key: "has-item",
                        x: 650,
                        y: 300,
                        // inputs: {
                        //     item: {
                        //         ids: { [`value.${itemSourceId}.outputs.item`]: true },
                        //     },
                        // },
                    },
                    {
                        id: itemSourceId,
                        type: "value",
                        key: "item-source",
                        x: 380,
                        y: 330,
                        inputs: {
                            uuid: { value: "Compendium.pf2e.equipment-srd.Item.7Uk6LMmzsCxuhhA6" },
                        },
                        // outputs: {
                        //     item: {
                        //         ids: { [`condition.${hasItemId}.inputs.item`]: true },
                        //     },
                        // },
                    },
                ],
            },
        ];

        // end of test

        this.clear();

        for (const triggerData of []) {
            const trigger = createTrigger(triggerData);

            if (trigger) {
                this.set(trigger.id, trigger);
            }
        }

        MODULE.debug("triggers", this);
    }
}

export default new TriggerCollection();
export type { TriggerCollection };
