import { BlueprintMenu } from "blueprint";
import { TriggerDataCollection } from "data";
import { MODULE, registerSetting, registerSettingMenu } from "module-helpers";

MODULE.register("pf2e-trigger");
MODULE.enableDebugMode();

Hooks.once("init", () => {
    registerSetting("world-triggers", {
        type: Array,
        default: [],
        scope: "world",
        config: false,
        onChange: () => {
            TriggerDataCollection.refresh();
        },
    });

    registerSettingMenu("triggers-menu", {
        type: BlueprintMenu,
        restricted: true,
    });
});

Hooks.once("setup", () => {
    TriggerDataCollection.refresh();
});
