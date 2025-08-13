import { NodeSchemaOf } from "schema";
import { TriggerNode } from "..";
import { ATTACK_OPTIONS, AttackTriggerOptions } from "hook";

class AttackTriggerNode extends TriggerNode<
    NodeSchemaOf<"event", "attack-roll">,
    AttackTriggerOptions
> {
    async execute(): Promise<boolean> {
        for (const option of ATTACK_OPTIONS) {
            this.setVariable(option, this.getOption(option));
        }

        return this.send("out");
    }
}

export { AttackTriggerNode };
