import { MODULE, R, getSetting } from "module-helpers";
import { TriggerData, TriggerRawData, processTriggerData } from "./data-trigger";

let TRIGGERS: Record<string, TriggerData[]>;

function getTriggersDataMap(): Record<string, TriggerData> {
    return R.pipe(
        R.values(TRIGGERS),
        R.flatMap(R.identity()),
        R.mapToObj((trigger) => [trigger.id, fu.deepClone(trigger)])
    );
}

function prepareTriggersData(): TriggerData[] {
    const rawData = getSetting<TriggerRawData[]>("triggers");
    const triggers = processTriggers(rawData);

    TRIGGERS = R.groupBy(triggers, (trigger) => trigger.event.key);
    MODULE.debug("TRIGGERS DATA", TRIGGERS);

    return triggers;
}

function processTriggers(triggers: TriggerRawData[]): TriggerData[] {
    return R.pipe(
        triggers,
        R.map((data) => processTriggerData(data)),
        R.filter(R.isTruthy)
    );
}

export { getTriggersDataMap, prepareTriggersData, processTriggers };
