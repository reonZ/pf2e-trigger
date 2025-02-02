import { TriggerData } from "data/data-trigger";
import { R } from "module-helpers";
import { addItemSchema } from "./action/schema-add-item";
import { removeItemSchema } from "./action/schema-remove-item";
import { rollDamageSchema } from "./action/schema-roll-damage";
import { rollSaveSchema } from "./action/schema-roll-save";
import { runMacroSchema } from "./action/schema-run-macro";
import { hasItemSchema } from "./condition/schema-has-item";
import { hasOptionSchema } from "./condition/schema-has-option";
import { insideAuraSchema } from "./condition/schema-inside-aura";
import { auraEventSchema } from "./event/schema-aura-event";
import { eventSchema } from "./event/schema-event";
import { createLogicSchema } from "./logic/schema-logic";
import {
    NodeEntryType,
    NodeSchema,
    NodeSchemaInputEntry,
    NodeSchemaOutputEntry,
    NodeType,
    isInputConnection,
} from "./schema";
import { itemSourceSchema } from "./value/schema-item-source";
import { macroSourceSchema } from "./value/schema-macro-source";
import { successValueSchema } from "./value/schema-success-value";
import { createValueSchema } from "./value/schema-value";
import { successSplitSchema } from "./logic/schema-success-split";
import { schemaVariable } from "./schema-variable";
import { rollDataSchema } from "./value/schema-roll-data";
import { dcValueSchema, dcTargetSchema } from "./value/schema-dc-data";
import { addConditionSchema } from "./action/schema-add-condition";
import { durationSingleSchema, durationUnitSchema } from "./value/schema-duration.data";

const SCHEMAS = {
    action: {
        "roll-save": rollSaveSchema,
        "roll-damage": rollDamageSchema,
        "add-item": addItemSchema,
        "remove-item": removeItemSchema,
        "run-macro": runMacroSchema,
        "add-condition": addConditionSchema,
    },
    condition: {
        "has-item": hasItemSchema,
        "has-option": hasOptionSchema,
        "inside-aura": insideAuraSchema,
    },
    event: {
        "aura-enter": auraEventSchema,
        "aura-leave": auraEventSchema,
        "turn-start": eventSchema,
        "turn-end": eventSchema,
        "token-create": eventSchema,
        "token-delete": eventSchema,
        "test-event": eventSchema,
    },
    logic: {
        "eq-number": createLogicSchema("number"),
        "gt-number": createLogicSchema("number"),
        "lt-number": createLogicSchema("number"),
        "gte-number": createLogicSchema("number"),
        "lte-number": createLogicSchema("number"),
        // "eq-text": createLogicSchema("text"),
        "success-split": successSplitSchema,
    },
    value: {
        "item-source": itemSourceSchema,
        "macro-source": macroSourceSchema,
        "number-value": createValueSchema("number"),
        "success-value": successValueSchema,
        "roll-data": rollDataSchema,
        "dc-value": dcValueSchema,
        "dc-target": dcTargetSchema,
        "duration-encounter": durationSingleSchema,
        "duration-unlimited": durationSingleSchema,
        "duration-unit": durationUnitSchema,
    },
    variable: {
        variable: schemaVariable,
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
                    unique: schema.unique,
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

                return { type, key, inputs, outputs };
            })
        );
    }),
    R.filter(({ type }) => !["event", "variable"].includes(type))
);

function getFilters(trigger?: TriggerData | null): NodeFilter[] {
    const uniques = R.pipe(
        R.values(trigger?.nodes ?? {}),
        R.flatMap(({ key, type }) => {
            const { unique } = getSchema({ key, type });

            if (R.isArray(unique)) {
                return [key, ...unique];
            } else if (unique) {
                return [key];
            } else {
                return [];
            }
        })
    );

    return R.pipe(
        FILTERS,
        R.filter(({ key }) => !uniques.includes(key))
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
    return R.isString(key) && (type === "variable" || key in SCHEMAS[type]);
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
    NodeSchemaMap,
    NodeSchemas,
};
