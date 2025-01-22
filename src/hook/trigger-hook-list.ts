import { TriggerData } from "data/data-trigger";
import { EndTurnHook, StartTurnHook } from "./hook-turn";
import { AuraHook } from "./hook-aura";
import { CreateTokenHook, DeleteTokenHook } from "./hook-token";

const HOOKS = [
    new StartTurnHook(),
    new EndTurnHook(),
    new AuraHook(),
    new CreateTokenHook(),
    new DeleteTokenHook(),
];

function prepareHooks(triggers: TriggerData[]) {
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
}

export { prepareHooks };
