import { PF2eTriggerBehaviorType } from "hook/region/hook-region-behavior";
import { MODULE, R, registerSetting, registerSettingMenu } from "module-helpers";
import { prepareTriggers } from "trigger/trigger-list";
import { TriggersMenu } from "triggers-menu";

MODULE.register("pf2e-trigger");

Hooks.once("init", () => {
    registerSetting({
        key: "triggers",
        type: Array,
        default: [],
        scope: "world",
        config: false,
        onChange: () => {
            prepareTriggers();
        },
    });

    registerSettingMenu({
        key: "triggers-menu",
        type: TriggersMenu,
    });
});

Hooks.once("setup", () => {
    CONFIG.Pf2eTrigger = {
        addConditionTypes: R.omit(CONFIG.PF2E.conditionTypes, ["persistent-damage"]),
        reduceConditionTypes: R.pipe(
            R.entries(CONFIG.PF2E.conditionTypes),
            R.filter(([key]) => {
                const condition = game.pf2e.ConditionManager.conditions.get(key);
                return !!condition?.system.value.isValued;
            }),
            R.mapToObj(([key, value]) => [key, value])
        ),
    };

    CONFIG.RegionBehavior.dataModels[MODULE.path("trigger")] = PF2eTriggerBehaviorType;
    CONFIG.RegionBehavior.typeIcons[MODULE.path("trigger")] = "fa-solid fa-land-mine-on";

    prepareTriggers();
});
