import { TriggerData } from "@data/data-trigger";
import { R } from "module-helpers";
import { rollSaveSchema } from "./action/roll-save-schema";
import { hasItemSchema } from "./condition/has-item-schema";
import { eventSchema } from "./event/event-schema";
import {
    NodeEntryType,
    NodeSchema,
    NodeSchemaInputEntry,
    NodeSchemaOutputEntry,
    NodeType,
    isInputConnection,
} from "./schema";
import { itemSourceSchema } from "./value/item-source-schema";
import { createLogicSchema } from "./logic/logic-schema";
import { createValueSchema } from "./value/value-schema";
import { successValueSchema } from "./value/success-value-schema";

const SCHEMAS = {
    action: {
        "roll-save": rollSaveSchema,
    },
    event: {
        "turn-start": eventSchema,
        "turn-end": eventSchema,
    },
    condition: {
        "has-item": hasItemSchema,
    },
    value: {
        "item-source": itemSourceSchema,
        "number-value": createValueSchema("number"),
        "success-value": successValueSchema,
    },
    logic: {
        "eq-number": createLogicSchema("number"),
        // "eq-text": createLogicSchema("text"),
    },
} satisfies Record<NodeType, Record<string, NodeSchema>>;

const SCHEMA_MAP = R.pipe(
    SCHEMAS,
    R.mapValues((group) =>
        R.pipe(
            group,
            R.mapValues((schema: NodeSchema): NodeSchemaMap => {
                return {
                    in: schema.in,
                    isUnique: schema.isUnique,
                    inputs: R.mapToObj(schema.inputs ?? [], (input) => [input.key, input]),
                    outputs: R.mapToObj(schema.outputs, (output) => [output.key, output]),
                };
            })
        )
    )
);

const FILTERS: NodeFilter[] = R.pipe(
    R.entries(SCHEMAS),
    R.flatMap(([type, schemas]) => {
        return R.pipe(
            R.entries(schemas),
            R.map(([key, schema]: [string, NodeSchema]): NodeFilter => {
                const inputs: NodeEntryType[] = R.pipe(
                    schema.inputs ?? [],
                    R.filter(isInputConnection),
                    R.map((input) => input.type),
                    R.unique()
                );

                if (schema.in) {
                    inputs.unshift(undefined);
                }

                const outputs = R.pipe(
                    schema.outputs,
                    R.map((output) => output.type),
                    R.unique()
                );

                return {
                    type,
                    key,
                    inputs,
                    outputs,
                };
            })
        );
    }),
    R.filter(({ type }) => type !== "event")
);

function getFilters(trigger?: TriggerData | null): NodeFilter[] {
    const uniques = R.pipe(
        R.values(trigger?.nodes ?? {}),
        R.filter((node) => !!(getSchema(node) as NodeSchema).isUnique),
        R.map(({ type, key }) => ({ key, type }))
    );

    return R.pipe(
        FILTERS,
        R.filter((filter) => !uniques.some((unique) => R.hasSubObject(filter, unique)))
    );
}

function getSchemaMap<T extends NodeType>({ type, key }: { type: T; key: string }): NodeSchemaMap {
    // @ts-expect-error
    return SCHEMA_MAP[type][key];
}

function getSchema<T extends NodeType>({ type, key }: { type: T; key: string }): NodeSchema {
    // @ts-expect-error
    const schema = fu.deepClone(SCHEMAS[type][key]);

    if (schema.in) {
        schema.inputs ??= [];
        schema.inputs.unshift({ key: "in" });
    }

    return schema;
}

function getEventKeys(): EventNodeKey[] {
    return R.keys(SCHEMAS.event);
}

function isNodeKey<T extends NodeType>(type: T, key: any): key is NodeKey<T> {
    return R.isString(key) && key in SCHEMAS[type];
}

type NodeSchemas = typeof SCHEMAS;

type ExtractNodeMap<T> = {
    [t in NodeType]: NodeSchemas[t] extends Record<infer K extends string, NodeSchema>
        ? { [k in K]: T }
        : never;
};

type ExtractPartialNodeMap<T> = {
    [t in NodeType]?: NodeSchemas[t] extends Record<infer K extends string, NodeSchema>
        ? { [k in K]?: T }
        : never;
};

type NodeKey<T extends NodeType> = keyof NodeSchemas[T];

type NodeEventKey = keyof (typeof SCHEMAS)["event"];
type NodeConditionKey = keyof (typeof SCHEMAS)["condition"];

type NodeFilter = {
    type: NodeType;
    key: string;
    inputs: NodeEntryType[];
    outputs: NodeEntryType[];
};

type EventNodeKey = keyof (typeof SCHEMAS)["event"];

type NodeSchemaMap = Omit<NodeSchema, "inputs" | "outputs"> & {
    inputs: Record<string, NodeSchemaInputEntry>;
    outputs: Record<string, NodeSchemaOutputEntry>;
};

export { getEventKeys, getFilters, getSchema, getSchemaMap, isNodeKey };
export type {
    EventNodeKey,
    ExtractNodeMap,
    ExtractPartialNodeMap,
    NodeConditionKey,
    NodeEventKey,
    NodeFilter,
    NodeKey,
    NodeSchemas,
    NodeSchemaMap,
};
