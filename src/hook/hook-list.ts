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
} from "hook";
import { MODULE } from "module-helpers";
import { CombatantHook } from ".";

const HOOKS: TriggerHook[] = [
    new AuraHook(),
    new CombatantHook("createCombatant", "combatant-create", "CombatantCreate"),
    new CombatantHook("deleteCombatant", "combatant-delete", "CombatantDelete"),
    new ExecuteHook(),
    new MessageHook(),
    REGION_HOOK,
    new TestHook(),
    new TokenCreateHook(),
    new TokenDeleteHook(),
    new TokenMoveHook(),
    new CombatantHook("pf2e.endTurn", "turn-end", "TurnEnd"),
    new CombatantHook("pf2e.startTurn", "turn-start", "TurnStart"),
];

function prepareHooks(triggers: TriggerData[]) {
    MODULE.group("Prepare Hooks");
    for (const hook of HOOKS) {
        hook.initialize(triggers);
    }
    MODULE.groupEnd();
}

export { prepareHooks };
