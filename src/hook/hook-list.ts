import { Trigger } from "trigger/trigger";
import { StartTurnHook } from "./turn/hook-turn-start";
import { EndTurnHook } from "./turn/hook-turn-end";
import { AuraHook } from "./aura/hook-aura";
import { CreateTokenHook } from "./token.ts/hook-token-create";
import { DeleteTokenHook } from "./token.ts/hook-token.delete";
import { TestHook } from "./test/hook-test";

const HOOKS = [
    new StartTurnHook(),
    new EndTurnHook(),
    new AuraHook(),
    new CreateTokenHook(),
    new DeleteTokenHook(),
    new TestHook(),
];

function prepareHooks(triggers: Trigger[]) {
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
}

export { prepareHooks };
