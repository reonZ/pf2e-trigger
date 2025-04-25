import { BlueprintApplication } from "blueprint";
import { WorldTriggers, TriggerData, TriggerNodeData } from "data";
import { MODULE, registerSetting, registerSettingMenu } from "module-helpers";

MODULE.register("pf2e-trigger");
MODULE.enableDebugMode();

Hooks.once("setup", () => {
    // TriggerDataCollection.refresh();

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
            // TriggerDataCollection.refresh();
        },
    });

    registerSettingMenu("triggers-menu", {
        type: BlueprintApplication,
        restricted: true,
    });
});
