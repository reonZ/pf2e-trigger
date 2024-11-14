import { MODULE, registerSetting, registerSettingMenu, userIsGM } from "foundry-pf2e";
import { CustomTriggers } from "./apps/customs";
import { prepareTriggers } from "./trigger";

MODULE.register("pf2e-trigger", "PF2e Trigger");

Hooks.once("init", () => {
    registerSetting({
        key: "customTriggers",
        type: Array,
        default: [],
        scope: "world",
        config: false,
        onChange: () => {
            if (userIsGM()) {
                prepareTriggers();
            }
        },
    });

    registerSettingMenu({
        key: "customs",
        type: CustomTriggers,
    });

    if (userIsGM()) {
        prepareTriggers();
    }
});
