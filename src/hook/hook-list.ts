import { TriggerData } from "data";
import {
    AuraHook,
    ExecuteHook,
    MessageHook,
    REGION_HOOK,
    TestHook,
    TokenHook,
    TriggerHook,
    TurnHook,
} from "hook";
import { MODULE } from "module-helpers";

const HOOKS: TriggerHook[] = [
    new AuraHook(),
    new ExecuteHook(),
    new MessageHook(),
    REGION_HOOK,
    new TestHook(),
    new TokenHook(),
    new TurnHook(),
];

function prepareHooks(triggers: TriggerData[]) {
    MODULE.group("Prepare Hooks");
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
    MODULE.groupEnd();
    MODULE.debug(HOOKS);
}

export { prepareHooks };
