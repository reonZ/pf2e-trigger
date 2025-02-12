import { MODULE } from "module-helpers";
import { AuraHook } from "./aura/hook-aura";
import { ExecuteHook } from "./execute/hook-execute";
import { RegionHook } from "./region/hook-region";
import { TestHook } from "./test/hook-test";
import { CreateTokenHook } from "./token.ts/hook-token-create";
import { DeleteTokenHook } from "./token.ts/hook-token.delete";
import { EndTurnHook } from "./turn/hook-turn-end";
import { StartTurnHook } from "./turn/hook-turn-start";

const regionHook = new RegionHook();

const HOOKS = [
    new StartTurnHook(),
    new EndTurnHook(),
    new AuraHook(),
    new CreateTokenHook(),
    new DeleteTokenHook(),
    new TestHook(),
    new ExecuteHook(),
    regionHook,
];

function prepareHooks(triggers: TriggerData[]) {
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
}

function executeRegionHook(id: string, target: TargetDocuments) {
    const trigger = regionHook.getTrigger(id);

    if (!trigger) {
        MODULE.error(`the trigger '${id}' does not exist.`);
        return;
    }

    regionHook.executeTrigger(trigger, { this: target });
}

export { executeRegionHook, prepareHooks };
