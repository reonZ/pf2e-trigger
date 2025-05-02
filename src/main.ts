import { BlueprintApplication } from "blueprint";
import { TriggerData, TriggerNodeData, WorldTriggers } from "data";
import { MODULE, registerSetting, registerSettingMenu } from "module-helpers";
import { prepareTriggers } from "trigger";

MODULE.register("pf2e-trigger");
MODULE.enableDebugMode();

Hooks.once("setup", () => {
    // @ts-expect-error
    CONFIG.Trigger = {
        documentClass: TriggerData,
    };
    // @ts-expect-error
    CONFIG.Node = {
        documentClass: TriggerNodeData,
    };
});

Hooks.once("init", () => {
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
