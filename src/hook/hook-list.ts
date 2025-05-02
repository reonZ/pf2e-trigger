import { TriggerData } from "data";
import { AuraHook, TestHook, TriggerHook } from "hook";
import { MODULE } from "module-helpers";

const HOOKS: TriggerHook[] = [
    new TestHook(), //
    new AuraHook(),
];

function prepareHooks(triggers: TriggerData[], subtriggers: TriggerData[]) {
    MODULE.group("Prepare Hooks");
    for (const hook of HOOKS) {
        hook.initialize(triggers, subtriggers);
    }
    MODULE.groupEnd();
}

export { prepareHooks };
