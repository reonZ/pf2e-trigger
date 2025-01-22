import { MODULE, registerSetting, registerSettingMenu, userIsGM } from "module-helpers";
import { prepareTriggers } from "trigger/trigger-list";
import { TriggersMenu } from "triggers-menu";

MODULE.register("pf2e-trigger");

// TODO remove this
// @ts-expect-error
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
        key: "triggers-menu",
        type: TriggersMenu,
    });
});

Hooks.once("setup", () => {
    if (userIsGM()) {
        prepareTriggers();
    }
});
