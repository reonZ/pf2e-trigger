import { MODULE, registerSetting, registerSettingMenu, userIsGM } from "foundry-pf2e";
import { CustomTriggers } from "./apps/customs";
import { prepareTriggers, Trigger } from "./trigger";

MODULE.register("pf2e-trigger", "PF2e Trigger");

Hooks.once("init", () => {
    registerSetting({
        key: "customTriggers",
        type: Array,
        // TODO remove that
        default: [
            // {
            //     event: "aura-enter",
            //     conditions: {
            //         auraSlug: "kinetic-aura",
            //         targetItem: undefined,
            //         originItem: "Compendium.pf2e.feat-effects.Item.2EMak2C8x6pFwoUi",
            //         includeSelf: false,
            //         targets: "enemies",
            //     },
            //     actions: {
            //         rollDamage: {
            //             formula: "(floor(@actor.level/2))[fire]",
            //             item: "Compendium.pf2e.feats-srd.Item.XJCsa3UbQtsKcqve",
            //             usedOptions: {
            //                 formula: true,
            //                 item: true,
            //             },
            //         },
            //     },
            //     usedConditions: {
            //         auraSlug: true,
            //         targetItem: false,
            //         originItem: true,
            //         includeSelf: false,
            //         targets: true,
            //     },
            // } satisfies Trigger,
        ],
        scope: "world",
        config: false,
    });

    registerSettingMenu({
        key: "customs",
        type: CustomTriggers,
    });

    if (userIsGM()) {
        prepareTriggers();
    }
});
