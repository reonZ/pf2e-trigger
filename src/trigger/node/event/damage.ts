import { DAMAGE_OPTIONS, DamageTriggerOptions } from "hook";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class DamageTriggerNode extends TriggerNode<
    NodeSchemaOf<"event", "damage-taken">,
    DamageTriggerOptions
> {
    async execute(): Promise<boolean> {
        for (const option of DAMAGE_OPTIONS) {
            this.setVariable(option, this.getOption(option));
        }

        return this.send("out");
    }
}

export { DamageTriggerNode };
