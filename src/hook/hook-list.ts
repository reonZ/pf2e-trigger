import { TriggerData } from "data";
import {
    AuraHook,
    ExecuteHook,
    REGION_HOOK,
    TestHook,
    TokenHook,
    TriggerHook,
    TurnHook,
} from "hook";
import { MODULE } from "module-helpers";
import { MessageHook } from "./message";

const HOOKS: TriggerHook[] = [
    new AuraHook(),
    new ExecuteHook(),
    new MessageHook(),
    REGION_HOOK,
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
    MODULE.debug(HOOKS);
}

export { prepareHooks };
