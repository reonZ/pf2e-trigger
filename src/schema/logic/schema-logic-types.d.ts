import { createLogicSchema } from "./schema-logic";

declare global {
    type LogicSchema<T extends NonNullable<NodeEntryType>> = ReturnType<
        typeof createLogicSchema<T>
    >;

    type SplitterSchema = {
        in: true;
        outs: ReadonlyArray<NodeSchemaBridge>;
        inputs: [NodeSchemaInput];
    };
}
