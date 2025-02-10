import { MODULE, R, registerSetting, registerSettingMenu, userIsGM } from "module-helpers";
import { prepareTriggers } from "trigger/trigger-list";
import { TriggersMenu } from "triggers-menu";

MODULE.register("pf2e-trigger");

Hooks.once("init", () => {
    CONFIG.Pf2eTrigger = {
        conditionTypes: R.omit(CONFIG.PF2E.conditionTypes, [
            "dying",
            "unconscious",
            "persistent-damage",
        ]),
    };

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
