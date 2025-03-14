import { TokenHook } from "./hook-token";

class CreateTokenHook extends TokenHook {
    constructor() {
        super("createToken");
    }

    get events(): ["token-create"] {
        return ["token-create"];
    }
}

export { CreateTokenHook };
