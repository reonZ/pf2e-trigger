import { MODULE } from "module-helpers";
import { ActorHook } from "./hook-actor";
import { AuraHook } from "./hook-aura";
import { MessageHook } from "./hook-message";
import { ExecuteHook } from "./hook-execute";
import { ItemHook } from "./hook-item";
import { RegionHook } from "./hook-region";
import { TestHook } from "./hook-test";
import { TokenHook } from "./hook-token";
import { TurnHook } from "./hook-turn";

const regionHook = new RegionHook();

const HOOKS = [
    new TurnHook(),
    new AuraHook(),
    new TokenHook(),
    new TestHook(),
    new ExecuteHook(),
    new ActorHook(),
    new ItemHook(),
    new MessageHook(),
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
