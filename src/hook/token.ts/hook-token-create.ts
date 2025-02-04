import { TokenHook } from "./hook-token";

class CreateTokenHook extends TokenHook {
    constructor() {
        super("createToken");
    }

    get events(): NodeEventKey[] {
        return ["token-create"];
    }
}

export { CreateTokenHook };
