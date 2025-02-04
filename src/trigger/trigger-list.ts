import { prepareTriggersData } from "data/data-trigger-list";
import { prepareHooks } from "hook/hook-list";
import { R } from "module-helpers";

let SUBTRIGGERS: Record<string, TriggerData> = {};

function prepareTriggers() {
    const [subtriggers, triggers] = R.pipe(
        prepareTriggersData(),
        R.filter((trigger) => !trigger.disabled),
        R.partition((trigger) => trigger.isSub)
    );

    SUBTRIGGERS = R.mapToObj(subtriggers, (trigger) => [trigger.id, trigger]);

    prepareHooks(triggers);
}

function getSubtrigger(id: string): TriggerData | undefined {
    return SUBTRIGGERS[id];
}

export { getSubtrigger, prepareTriggers };
