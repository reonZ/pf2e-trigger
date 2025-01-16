import { TriggerData } from "@data/data-trigger";
import { EndTurnHook, StartTurnHook } from "./turn-hook";

const HOOKS = [new StartTurnHook(), new EndTurnHook()];

function prepareHooks(triggers: TriggerData[]) {
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
}

export { prepareHooks };
