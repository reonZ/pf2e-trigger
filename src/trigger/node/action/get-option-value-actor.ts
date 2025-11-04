import { R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GetOptionValueActorTriggerNode extends TriggerNode<
    NodeSchemaOf<"action", "get-option-value-actor">
> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");
        const option = await this.get("option");

        if (!option || !actor) {
            this.setVariable("value", -1);
            return this.send("out");
        }

        const withSuffix = `${option}:`;
        const match = R.pipe(
            R.values(actor.rollOptions) as Record<string, boolean>[],
            R.flatMap((x) => R.keys(x)),
            R.find((x) => x.startsWith(withSuffix))
        );
        const value = match ? Number(match.split(":").at(-1)) : null;

        this.setVariable("value", R.isNumber(value) ? value : -1);
        return this.send("out");
    }
}

export { GetOptionValueActorTriggerNode };
