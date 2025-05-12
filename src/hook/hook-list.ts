import { TriggerData } from "data";
import { AuraHook, TestHook, TokenHook, TriggerHook, TurnHook } from "hook";
import { MODULE } from "module-helpers";

const HOOKS: TriggerHook[] = [
    new AuraHook(), //
    new TestHook(),
    new TokenHook(),
    new TurnHook(),
];

function prepareHooks(triggers: TriggerData[], subtriggers: TriggerData[]) {
    MODULE.group("Prepare Hooks");
    for (const hook of HOOKS) {
        hook.initialize(triggers, subtriggers);
    }
    MODULE.groupEnd();
}

export { prepareHooks };
