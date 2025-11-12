import { TriggerData } from "data";
import {
    AuraHook,
    ExecuteHook,
    MessageHook,
    REGION_HOOK,
    TestHook,
    TokenHook,
    TokenMoveHook,
    TriggerHook,
} from "hook";
import { MODULE } from "module-helpers";
import { CombatantHook } from ".";

const HOOKS: TriggerHook[] = [
    new AuraHook(),
    new CombatantHook("createCombatant", "combatant-create"),
    new CombatantHook("deleteCombatant", "combatant-delete"),
    new ExecuteHook(),
    new MessageHook(),
    REGION_HOOK,
    new TestHook(),
    new TokenHook("createToken", "token-create"),
    new TokenHook("deleteToken", "token-delete"),
    new TokenMoveHook(),
    new CombatantHook("pf2e.endTurn", "turn-end"),
    new CombatantHook("pf2e.startTurn", "turn-start"),
];

function prepareHooks(triggers: TriggerData[]) {
    MODULE.group("Prepare Hooks");
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
    MODULE.groupEnd();
}

export { prepareHooks };
