import { Trigger } from "trigger/trigger";
import { AuraHook } from "./hook-aura";
import { CreateTokenHook, DeleteTokenHook } from "./hook-token";
import { EndTurnHook, StartTurnHook } from "./hook-turn";

const HOOKS = [
    new StartTurnHook(),
    new EndTurnHook(),
    new AuraHook(),
    new CreateTokenHook(),
    new DeleteTokenHook(),
];

function prepareHooks(triggers: Trigger[]) {
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
}

export { prepareHooks };
