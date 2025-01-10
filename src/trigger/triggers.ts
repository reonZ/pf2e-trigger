import { MODULE } from "module-helpers";
import { Trigger, TriggerDataRaw, createTrigger } from "./trigger";

class TriggerCollection extends Collection<Trigger> {
    first(): Trigger {
        return this.values().next().value;
    }

    processTriggers() {
        // TODO use setting instead of that

        const hasItemId = fu.randomID();
        const itemSourceId = fu.randomID();

        const triggersData: Maybe<TriggerDataRaw>[] = [
            {
                id: fu.randomID(),
                name: "test",
                nodes: [
                    {
                        id: fu.randomID(),
                        type: "event",
                        key: "turn-start",
                        x: 50,
                        y: 200,
                    },
                    {
                        id: hasItemId,
                        type: "condition",
                        key: "has-item",
                        x: 350,
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
                        x: 80,
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

        for (const triggerData of triggersData) {
            const trigger = createTrigger(triggerData);

            if (trigger) {
                this.set(trigger.id, trigger);
            }
        }

        MODULE.debug("triggers", this);
    }
}

export default new TriggerCollection();
