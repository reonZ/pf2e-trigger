import { NodeSchemaOf } from "schema";
import { TriggerNode } from "..";
import { TokenMovedTriggerOptions } from "hook";

class TokenMovedTriggerNode extends TriggerNode<
    NodeSchemaOf<"event", "token-moved">,
    TokenMovedTriggerOptions
> {
    async execute(): Promise<boolean> {
        const data = this.getOption("data");

        this.setVariable("data", data);
        return this.send("out");
    }
}

export { TokenMovedTriggerNode };
