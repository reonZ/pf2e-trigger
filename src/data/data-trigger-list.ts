import { MODULE, R, getSetting } from "module-helpers";
import { processTriggerData } from "./data-trigger";

let TRIGGERS: TriggerData[];

function getTriggersDataMap(): Record<string, TriggerData> {
    return R.pipe(
        TRIGGERS,
        R.flatMap(R.identity()),
        R.mapToObj((trigger) => [trigger.id, fu.deepClone(trigger)])
    );
}

function prepareTriggersData(): TriggerData[] {
    const rawData = getSetting<TriggerRawData[]>("triggers");
    const triggers = processTriggers(rawData);

    TRIGGERS = triggers;
    MODULE.debug("TRIGGERS DATA", TRIGGERS);

    return triggers;
}

function processTriggers(allTriggers: TriggerRawData[]): TriggerData[] {
    const [subtriggers, triggers] = R.partition(allTriggers, (trigger) => {
        return !!trigger.nodes?.some((node) => {
            return node?.type === "subtrigger" && !R.isString(node.subId);
        });
    });

    const processedSubtriggers = R.pipe(
        subtriggers,
        R.map((data) => processTriggerData(data)),
        R.filter(R.isTruthy)
    );

    const processedTriggers = R.pipe(
        triggers,
        R.map((data) => processTriggerData(data, processedSubtriggers)),
        R.filter(R.isTruthy)
    );

    return [...processedSubtriggers, ...processedTriggers];
}

export { getTriggersDataMap, prepareTriggersData, processTriggers };
