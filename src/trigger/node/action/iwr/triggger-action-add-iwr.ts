import { executeEffect } from "helpers/helpers-effect";
import { ImmunityType, ResistanceType, WeaknessType, localize } from "module-helpers";
import { addImmunitySchema } from "schema/action/iwr/schema-action-add-immunity";
import { addResistanceSchema } from "schema/action/iwr/schema-action-add-resistance";
import { addWeaknessSchema } from "schema/action/iwr/schema-action-add-weakness";
import { TriggerNode } from "trigger/node/trigger-node";

abstract class AddIwrTriggerNode<TType extends IwrType> extends TriggerNode<IwrSchema> {
    abstract get iwrKey(): IwrKey;
    abstract get iwrImg(): ImageFilePath;

    async execute(): Promise<void> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("out");
        }

        const type = await this.get("type");

        executeEffect(this, actor, null, async () => {
            const title = localize(this.localizePath, "title");

            const rule: IwrRule<TType> = {
                key: this.iwrKey,
                type,
            };

            if (this.iwrKey !== "Immunity") {
                const value = await this.get("value");
                rule.value = Math.max(value, 1);
            }

            const exceptions = this.custom.inputs.filter((input) =>
                input.key.endsWith("-exception")
            );

            if (exceptions.length) {
                rule.exceptions = [];

                for (const { key } of exceptions) {
                    const value = await this.get(key);
                    rule.exceptions.push(value);
                }
            }

            if (this.iwrKey === "Resistance") {
                const doubles = this.custom.inputs.filter((input) => input.key.endsWith("-double"));

                if (doubles.length) {
                    rule.doubleVs = [];

                    for (const { key } of doubles) {
                        const value = await this.get(key);
                        rule.doubleVs.push(value);
                    }
                }
            }

            return {
                rule,
                name: `${title} (${type})`,
                img: this.iwrImg,
            };
        });

        return this.send("out");
    }
}

interface AddIwrTriggerNode<TType extends IwrType> extends TriggerNode<IwrSchema> {
    get(key: "type"): Promise<TType>;
    get<K extends ExtractSchemaInputs<IwrSchema>>(
        key: K
    ): Promise<ExtractSchemaInputValueType<IwrSchema, K>>;
    get(key: string): Promise<TType>;
}

type IwrRule<TType extends IwrType> = {
    key: IwrKey;
    type: TType;
    value?: number;
    exceptions?: TType[];
    doubleVs?: TType[];
};

type IwrType = ImmunityType | ResistanceType | WeaknessType;

type IwrKey = "Immunity" | "Weakness" | "Resistance";

type IwrSchema = typeof addImmunitySchema | typeof addWeaknessSchema | typeof addResistanceSchema;

export { AddIwrTriggerNode };
