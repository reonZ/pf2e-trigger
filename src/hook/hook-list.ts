import { TriggerData } from "data";
import {
    AuraHook,
    ExecuteHook,
    MessageHook,
    REGION_HOOK,
    TestHook,
    TokenCreateHook,
    TokenDeleteHook,
    TokenMoveHook,
    TriggerHook,
    TurnEndHook,
    TurnStartHook,
} from "hook";
import { MODULE } from "module-helpers";

const HOOKS: TriggerHook[] = [
    new AuraHook(),
    new ExecuteHook(),
    new MessageHook(),
    REGION_HOOK,
    new TestHook(),
    new TokenCreateHook(),
    new TokenDeleteHook(),
    new TokenMoveHook(),
    new TurnEndHook(),
    new TurnStartHook(),
];

function prepareHooks(triggers: TriggerData[]) {
    MODULE.group("Prepare Hooks");
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
    MODULE.groupEnd();
}

export { prepareHooks };
