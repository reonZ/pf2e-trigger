import { createValueSchema } from "./schema-value-primitive";

declare global {
    type PrimitiveValueSchema<T extends PrimitiveEntryType> = ReturnType<
        typeof createValueSchema<T>
    >;

    type SimpleValueSchema = {
        inputs: [{ key: string; type: NonNullable<NodeEntryType> }];
        variables: [NodeSchemaVariable];
    };

    type ValueSchema = {
        inputs: NodeSchemaInput[];
        variables: [NodeSchemaVariable];
    };
}
