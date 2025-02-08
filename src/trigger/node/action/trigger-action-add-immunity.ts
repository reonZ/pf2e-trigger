import { DurationNode, executeWithDuration } from "helpers/helpers-duration";
import { ImmunityType, imagePath, localize } from "module-helpers";
import { addImmunitySchema } from "schema/action/schema-action-add-immunity";
import { TriggerNode } from "../trigger-node";

class AddImmunityTriggerNode extends TriggerNode<typeof addImmunitySchema> {
    async execute(): Promise<void> {
        const type = (await this.get("type")) as ImmunityType;
        const target = (await this.get("target")) ?? this.target;

        executeWithDuration(this as DurationNode, target.actor, null, async () => {
            const immunity = localize(this.localizePath, "immunity");

            const rule: { key: "Immunity"; type: ImmunityType; exceptions: ImmunityType[] } = {
                key: "Immunity",
                type,
                exceptions: [],
            };

            for (const { key } of this.custom.inputs) {
                const value = (await this.get(key)) as ImmunityType;
                rule.exceptions.push(value);
            }

            return {
                rule,
                name: `${immunity} (${type})`,
                img: imagePath("ankh", "svg"),
            };
        });

        return this.send("out");
    }
}

export { AddImmunityTriggerNode };
