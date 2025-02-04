import { TurnHook } from "./hook-turn";

class EndTurnHook extends TurnHook {
    constructor() {
        super("pf2e.endTurn");
    }

    get events(): NodeEventKey[] {
        return ["turn-end"];
    }
}

export { EndTurnHook };
