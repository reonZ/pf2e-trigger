import { TokenHook } from "./hook-token";

class DeleteTokenHook extends TokenHook {
    constructor() {
        super("deleteToken");
    }

    get events(): NodeEventKey[] {
        return ["token-delete"];
    }
}

export { DeleteTokenHook };
