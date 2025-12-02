import { BlueprintApplication } from "blueprint";
import { TriggerData, TriggerNodeData, TriggersContext } from "data";
import { executeEvent, PF2eTriggerBehaviorType, UserQueryExecuteData } from "hook";
import { MODULE, R, registerSetting, registerSettingMenu } from "module-helpers";
import {
    confirmPrompt,
    prepareModuleTriggers,
    prepareTriggers,
    UserQueryPromptData,
} from "trigger";

MODULE.register("pf2e-trigger");
// MODULE.enableDebugMode();

Hooks.once("setup", async () => {
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
        immunityTypes: R.omit(CONFIG.PF2E.immunityTypes, ["custom"]),
        reduceConditionTypes: R.pipe(
            R.entries(CONFIG.PF2E.conditionTypes),
            R.filter(([key]) => {
                const condition = game.pf2e.ConditionManager.conditions.get(key);
                return !!condition?.system.value.isValued;
            }),
            R.mapToObj(([key, value]) => [key, value])
        ),
    };

    CONFIG.queries[MODULE.path("user-query")] = async function (data: UserQueries) {
        switch (data.action) {
            case "await-prompt": {
                return confirmPrompt(data);
            }

            case "execute-event": {
                return executeEvent(data);
            }
        }
    };

    CONFIG.RegionBehavior.dataModels[MODULE.path("trigger")] = PF2eTriggerBehaviorType;
    CONFIG.RegionBehavior.typeIcons[MODULE.path("trigger")] = "fa-solid fa-land-mine-on";

    // we register after CONFIG is set because foundry creates an instance right away
    registerSetting("world-triggers", {
        type: TriggersContext,
        default: new TriggersContext(),
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

    await prepareModuleTriggers();
    prepareTriggers();
});

MODULE.apiExpose({
    openBlueprintMenu: () => {
        new BlueprintApplication().render(true);
    },
});

type UserQueries = UserQueryPromptData | UserQueryExecuteData;
