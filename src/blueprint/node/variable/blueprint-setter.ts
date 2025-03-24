import { VariableBlueprintNode } from "./blueprint-variable";

class SetterBlueprintNode extends VariableBlueprintNode {
    get title(): string {
        return this.data.custom.inputs[0]?.label ?? this.key;
    }

    get subtitle(): null {
        return null;
    }

    get icon(): string {
        return "\uf044";
    }

    get headerColor(): number {
        return 0x2e2e2e;
    }

    get schema(): NodeSchema {
        const schema = super.schema;
        const { type, key } = schema.inputs[1] as NodeSchemaInput;

        return {
            ...schema,
            inputs: [{ key: "in" }, { key, type, field: true } as NodeSchemaInput],
        };
    }
}

export { SetterBlueprintNode };
