import { TriggerData } from "@data/data-trigger";
import { EndTurnHook, StartTurnHook } from "./hook-turn";
import { AuraHook } from "./hook-aura";

const HOOKS = [new StartTurnHook(), new EndTurnHook(), new AuraHook()];

function prepareHooks(triggers: TriggerData[]) {
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
}

export { prepareHooks };
