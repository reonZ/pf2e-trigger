import { removeImmunitySchema } from "schema/action/iwr/schema-action-remove-immunity";
import { TriggerNode } from "../../trigger-node";
import { ImmunityType, imagePath, localize } from "module-helpers";
import { executeEffect } from "helpers/helpers-effect";

class RemoveImmunityTriggerNode extends TriggerNode<typeof removeImmunitySchema> {
    async execute(): Promise<void> {
        const type = (await this.get("type")) as ImmunityType;
        const target = (await this.get("target")) ?? this.target;

        executeEffect(this, target.actor, null, async () => {
            const title = localize(this.localizePath, "title");

            const rule: { key: "Immunity"; type: ImmunityType; mode: "remove" } = {
                key: "Immunity",
                type,
                mode: "remove",
            };

            return {
                rule,
                name: `${title} (${type})`,
                img: imagePath("ankh", "svg"),
            };
        });

        return this.send("out");
    }
}

export { RemoveImmunityTriggerNode };
