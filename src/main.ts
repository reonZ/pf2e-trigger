import { MODULE, registerSetting, registerSettingMenu, userIsGM } from "module-helpers";
import { TriggersMenu } from "./apps/menu";
import { initializeTriggers, prepareTriggers } from "./trigger";

MODULE.register("pf2e-trigger");

// TODO remove this
CONFIG.debug.modules = true;

Hooks.once("init", () => {
    registerSetting({
        key: "triggers",
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
        key: "triggersMenu",
        type: TriggersMenu,
    });

    initializeTriggers();
});

Hooks.once("setup", () => {
    if (userIsGM()) {
        prepareTriggers();
    }
});
