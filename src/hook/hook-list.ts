import { TriggerData } from "data";
import { AuraHook, TestHook, TriggerHook, TurnHook } from "hook";
import { MODULE } from "module-helpers";

const HOOKS: TriggerHook[] = [
    new TestHook(), //
    new AuraHook(),
    new TurnHook(),
];

function prepareHooks(triggers: TriggerData[], subtriggers: TriggerData[]) {
    MODULE.group("Prepare Hooks");
    for (const hook of HOOKS) {
        hook.initialize(triggers, subtriggers);
    }
    MODULE.groupEnd();
    MODULE.debug(HOOKS);
}

export { prepareHooks };
