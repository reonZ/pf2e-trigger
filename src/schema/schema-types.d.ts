import { addItemSchema } from "./action/schema-action-add-item";
import { booleanSchemaOuts } from "./schema";
import { SCHEMAS } from "./schema-list";

declare global {
    type NodeSchemas = typeof SCHEMAS;
    type NodeKey<T extends NodeType> = keyof NodeSchemas[T];
    type NodeEventKey = keyof (typeof SCHEMAS)["event"];
    type NodeConditionKey = keyof (typeof SCHEMAS)["condition"];

    type NodeSchemaVariable = {
        key: string;
        label?: string;
        type: NonNullable<NodeEntryType>;
    };

    type NodeSchemaBridge = {
        key: string;
        label?: string;
    };

    type NodeRawSchema = {
        unique?: boolean | string[];
        in?: boolean;
        inputs?: ReadonlyArray<NodeSchemaInput>;
        outs?: ReadonlyArray<NodeSchemaBridge>;
        variables?: ReadonlyArray<NodeSchemaVariable>;
    };

    type NodeSchema = {
        unique: boolean | string[];
        inputs: NodeSchemaInputs;
        outputs: NodeSchemaOutputs;
        variables: ReadonlyArray<NodeSchemaVariable>;
    };

    type NodeSchemaInputs = (NodeSchemaInput | { key: "in" })[];
    type NodeSchemaOutputs = (NodeSchemaBridge | NodeSchemaVariable)[];
    type NodeSchemaEntry = NodeSchemaInput | NodeSchemaBridge | NodeSchemaVariable;

    type NodeSchemaFilter = {
        type: NodeType;
        key: string;
        inputs: NodeEntryType[];
        outputs: NodeEntryType[];
        unique: boolean;
    };

    type BooleanSchemaOuts = typeof booleanSchemaOuts;

    type ExtractNodeSchema<T extends NodeRawSchema = NodeRawSchema> = {
        unique: boolean;
        inputs: [
            ...(T extends { in: true } ? [{ key: "in" }] : []),
            ...(T extends { inputs?: infer I extends NodeSchemaInput[] } ? I : [])
        ];
        outputs: [
            ...(T extends { outs?: infer O extends NodeSchemaBridge[] } ? O : []),
            ...(T extends { variables?: infer V extends NodeSchemaVariable[] } ? V : [])
        ];
    };

    type ExtractSchemaOutsKeys<S extends NodeRawSchema> = S extends {
        outs: ReadonlyArray<{ key: infer K extends string }>;
    }
        ? K
        : string;

    type ExtractSchemaVariableKeys<S extends NodeRawSchema> = S extends {
        variables?: ReadonlyArray<{ key: infer K extends string }>;
    }
        ? K
        : string;

    type ExtractSchemaInputs<S extends NodeRawSchema> = S extends {
        inputs?: ReadonlyArray<{ key: infer K extends string }>;
    }
        ? K
        : string;

    type ExtractSchemaInputValueType<
        S extends NodeRawSchema,
        K extends ExtractSchemaInputs<S>
    > = S extends {
        inputs: ReadonlyArray<NodeSchemaInput>;
    }
        ? ExtractEntryType<Extract<S["inputs"][number], { key: K }>["type"]> | undefined
        : TriggerEntryValue;

    type ExtractSchemaVariableValueType<
        S extends NodeRawSchema,
        K extends ExtractSchemaVariableKeys<S>
    > = S extends {
        variables?: infer V extends ReadonlyArray<NodeSchemaVariable>;
    }
        ? V extends ReadonlyArray<NodeSchemaVariable>
            ? ExtractEntryType<Extract<V[number], { key: K }>["type"]> | undefined
            : TriggerEntryValue
        : TriggerEntryValue;
}
