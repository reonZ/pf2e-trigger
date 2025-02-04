import { prepareTriggersData } from "data/data-trigger-list";
import { MODULE, R } from "module-helpers";
import { Trigger } from "./trigger";
import { prepareHooks } from "hook/hook-list";
import { Subtrigger } from "./trigger-subtrigger";

function prepareTriggers() {
    const [subtriggersData, triggersData] = R.pipe(
        prepareTriggersData(),
        R.filter((trigger) => !trigger.disabled),
        R.partition((trigger) => trigger.isSub)
    );

    const subtriggers = R.pipe(
        subtriggersData,
        R.map((data) => new Subtrigger(data)),
        R.mapToObj((trigger) => [trigger.id, trigger])
    );

    const triggers = triggersData.map((data) => new Trigger(data, subtriggers));

    MODULE.debug("SUBTRIGGERS", subtriggers);
    MODULE.debug("TRIGGERS", triggers);

    prepareHooks(triggers);
}

export { prepareTriggers };
