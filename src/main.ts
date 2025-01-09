import triggers from "@trigger/triggers";
import { TriggersMenu } from "@trigger/triggers-menu";
import { MODULE, registerSetting, registerSettingMenu, userIsGM } from "module-helpers";

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
                triggers.processTriggers();
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
        triggers.processTriggers();
    }
});
