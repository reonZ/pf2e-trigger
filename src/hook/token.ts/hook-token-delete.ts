import { TokenHook } from "./hook-token";

class DeleteTokenHook extends TokenHook {
    constructor() {
        super("deleteToken");
    }

    get events(): ["token-delete"] {
        return ["token-delete"];
    }
}

export { DeleteTokenHook };
