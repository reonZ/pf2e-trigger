import { BlueprintApplication } from "blueprint";
import { TriggerData, TriggerNodeData, WorldTriggers } from "data";
import { MODULE, R, registerSetting, registerSettingMenu } from "module-helpers";
import { prepareTriggers } from "trigger";

MODULE.register("pf2e-trigger");
MODULE.enableDebugMode();

Hooks.once("init", () => {
    // @ts-expect-error
    CONFIG.Trigger = {
        documentClass: TriggerData,
    };
    // @ts-expect-error
    CONFIG.Node = {
        documentClass: TriggerNodeData,
    };

    // @ts-expect-error
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

    // we register after CONFIG is set because foundry creates an instance right away
    registerSetting("world-triggers", {
        type: WorldTriggers,
        default: new WorldTriggers(),
        scope: "world",
        config: false,
        onChange: () => {
            prepareTriggers();
        },
    });

    registerSettingMenu("triggers-menu", {
        type: BlueprintApplication,
        restricted: true,
    });

    prepareTriggers();
});
