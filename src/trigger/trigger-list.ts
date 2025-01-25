import { prepareTriggersData } from "data/data-trigger-list";
import { prepareHooks } from "hook/trigger-hook-list";
import { Trigger } from "./trigger";
import { MODULE } from "module-helpers";

function prepareTriggers() {
    const triggersData = prepareTriggersData().filter((trigger) => !trigger.disabled);
    const triggers = triggersData.map((data) => new Trigger(data));

    MODULE.debug("TRIGGERS", triggers);

    prepareHooks(triggers);
}

export { prepareTriggers };
