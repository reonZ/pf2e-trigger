import { AuraHook } from "./aura/hook-aura";
import { TestHook } from "./test/hook-test";
import { CreateTokenHook } from "./token.ts/hook-token-create";
import { DeleteTokenHook } from "./token.ts/hook-token.delete";
import { EndTurnHook } from "./turn/hook-turn-end";
import { StartTurnHook } from "./turn/hook-turn-start";

const HOOKS = [
    new StartTurnHook(),
    new EndTurnHook(),
    new AuraHook(),
    new CreateTokenHook(),
    new DeleteTokenHook(),
    new TestHook(),
];

function prepareHooks(triggers: TriggerData[]) {
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
}

export { prepareHooks };
