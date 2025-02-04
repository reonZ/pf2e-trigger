import { TurnHook } from "./hook-turn";

class StartTurnHook extends TurnHook {
    constructor() {
        super("pf2e.startTurn");
    }

    get events(): NodeEventKey[] {
        return ["turn-start"];
    }
}

export { StartTurnHook };
