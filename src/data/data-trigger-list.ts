import { MODULE, R } from "module-helpers";
import { TriggerData, TriggerRawData, processTriggerData } from "./data-trigger";

let TRIGGERS: Record<string, TriggerData[]>;

function getTriggersDataMap(): Record<string, TriggerData> {
    return R.pipe(
        R.values(TRIGGERS),
        R.flatMap(R.identity()),
        R.mapToObj((trigger) => [trigger.id, trigger])
    );
}

function prepareTriggersData() {
    // TODO use setting instead of that

    const eventId = fu.randomID();
    const conditionId = fu.randomID();
    const valueId = fu.randomID();

    const triggersRawData = [
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
                },
                {
                    id: conditionId,
                    type: "condition",
                    key: "has-item",
                    x: 350,
                    y: 300,
                    inputs: {
                        item: {
                            ids: { [`${valueId}.outputs.item`]: true },
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
                //             ids: { [`${valueId}.outputs.item`]: true },
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
                            ids: { [`${conditionId}.inputs.item`]: true },
                        },
                    },
                },
            ],
        },
    ] as unknown as TriggerRawData[];

    // end of test

    TRIGGERS = R.pipe(
        triggersRawData,
        // getSetting<TriggerRawData[]>("triggers"),
        R.map((data) => processTriggerData(data)),
        R.filter(R.isTruthy),
        R.groupBy((trigger) => trigger.event.key)
    );

    MODULE.debug("TRIGGERS", TRIGGERS);
}

export { getTriggersDataMap, prepareTriggersData };
