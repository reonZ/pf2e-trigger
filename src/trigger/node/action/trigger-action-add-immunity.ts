import { executeWithDuration } from "helpers/helpers-effect";
import { ImmunityType, imagePath, localize } from "module-helpers";
import { addImmunitySchema } from "schema/action/schema-action-add-immunity";
import { TriggerNode } from "../trigger-node";

class AddImmunityTriggerNode extends TriggerNode<typeof addImmunitySchema> {
    async execute(): Promise<void> {
        const type = (await this.get("type")) as ImmunityType;
        const target = (await this.get("target")) ?? this.target;

        executeWithDuration(this, target.actor, null, async () => {
            const title = localize(this.localizePath, "title");

            const rule: { key: "Immunity"; type: ImmunityType; exceptions: ImmunityType[] } = {
                key: "Immunity",
                type,
                exceptions: [],
            };

            for (const { key } of this.custom.inputs) {
                const value = await this.get(key);
                rule.exceptions.push(value);
            }

            return {
                rule,
                name: `${title} (${type})`,
                img: imagePath("ankh", "svg"),
            };
        });

        return this.send("out");
    }
}

interface AddImmunityTriggerNode extends TriggerNode<typeof addImmunitySchema> {
    get<K extends ExtractSchemaInputs<typeof addImmunitySchema>>(
        key: K
    ): Promise<ExtractSchemaInputValueType<typeof addImmunitySchema, K>>;
    get(key: string): Promise<ImmunityType>;
    get(key: string): NodeEntryValue;
}

export { AddImmunityTriggerNode };
