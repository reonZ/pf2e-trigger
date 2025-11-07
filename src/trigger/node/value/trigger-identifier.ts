import { R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class TriggerIdentifierTriggerNode extends TriggerNode<
    NodeSchemaOf<"value", "trigger-identifier">
> {
    async query(): Promise<string> {
        return R.pipe(
            [
                await this.get("key"), //
                (await this.getTargetActor("target"))?.uuid,
            ],
            R.filter(R.isTruthy),
            R.join("-")
        );
    }
}

export { TriggerIdentifierTriggerNode };
