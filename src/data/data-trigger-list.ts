import { MODULE, R } from "module-helpers";
import { TriggerData, TriggerRawData, processTriggerData } from "./data-trigger";

let TRIGGERS: Record<string, TriggerData[]>;

function getTriggersDataMap(): Record<string, TriggerData> {
    return R.pipe(
        R.values(TRIGGERS),
        R.flatMap(R.identity()),
        R.mapToObj((trigger) => [trigger.id, fu.deepClone(trigger)])
    );
}

function prepareTriggersData() {
    // TODO use setting instead of that

    const eventId = fu.randomID();
    const conditionId = fu.randomID();
    const valueId = fu.randomID();
    const actionId = fu.randomID();

    const triggersRawData: TriggerRawData[] = [
        {
            id: fu.randomID(),
            name: "Test Trigger",
            nodes: [
                {
                    id: eventId,
                    type: "event",
                    key: "turn-start",
                    x: 100,
                    y: 200,
                    outputs: {
                        out: {
                            ids: [`${conditionId}.inputs.in`],
                        },
                    },
                },
                {
                    id: conditionId,
                    type: "condition",
                    key: "has-item",
                    x: 350,
                    y: 300,
                    inputs: {
                        in: {
                            ids: [`${eventId}.outputs.out`],
                        },
                        item: {
                            ids: [`${valueId}.outputs.item`],
                        },
                    },
                    outputs: {
                        false: {
                            ids: [`${actionId}.inputs.in`],
                        },
                    },
                },
                // {
                //     id: fu.randomID(),
                //     type: "condition",
                //     key: "has-item",
                //     x: 150,
                //     y: 500,
                //     inputs: {
                //         item: {
                //             ids: [`${valueId}.outputs.item`],
                //         },
                //     },
                // },
                {
                    id: valueId,
                    type: "value",
                    key: "item-source",
                    x: 80,
                    y: 330,
                    inputs: {
                        uuid: { value: "Compendium.pf2e.equipment-srd.Item.7Uk6LMmzsCxuhhA6" },
                    },
                    outputs: {
                        item: {
                            ids: [`${conditionId}.inputs.item`],
                        },
                    },
                },
                {
                    id: actionId,
                    type: "action",
                    key: "roll-save",
                    x: 550,
                    y: 350,
                    inputs: {
                        in: {
                            ids: [`${conditionId}.outputs.false`],
                        },
                    },
                },
            ],
        },
    ];

    // end of test

    // getSetting<TriggerRawData[]>("triggers"),
    TRIGGERS = processTriggers(triggersRawData);

    MODULE.debug("TRIGGERS", TRIGGERS);
}

function processTriggers(triggers: TriggerRawData[]): Record<string, TriggerData[]> {
    return R.pipe(
        triggers,
        R.map((data) => processTriggerData(data)),
        R.filter(R.isTruthy),
        R.groupBy((trigger) => trigger.event.key)
    );
}

export { getTriggersDataMap, prepareTriggersData, processTriggers };
