import { TurnHook } from "./hook-turn";

class EndTurnHook extends TurnHook {
    constructor() {
        super("pf2e.endTurn");
    }

    get events(): ["turn-end"] {
        return ["turn-end"];
    }
}

export { EndTurnHook };
