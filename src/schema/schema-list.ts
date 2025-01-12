import { TriggerData } from "@data/data-trigger";
import { R } from "module-helpers";
import { hasItemSchema } from "./condition/has-item-schema";
import { eventSchema } from "./event/event-schema";
import { NodeEntryType, NodeSchema, NodeType } from "./schema";
import { itemSourceSchema } from "./value/item-source-schema";

const FIELD_TYPES: NodeEntryType[] = ["uuid", "text"];

const SCHEMAS = {
    event: {
        "turn-start": eventSchema,
        "turn-end": eventSchema,
    },
    condition: {
        "has-item": hasItemSchema,
    },
    value: {
        "item-source": itemSourceSchema,
    },
} satisfies Record<NodeType, Record<string, NodeSchema>>;

const FILTERS: TriggerNodeFilter[] = R.pipe(
    R.entries(SCHEMAS),
    R.flatMap(([type, schemas]) => {
        return R.entries(schemas).map(([key, schema]: [string, NodeSchema]) => {
            const inputs = R.pipe(
                schema.inputs ?? [],
                R.filter((input) => !input.type || !isFieldConnection(input.type)),
                R.map((input) => input.type),
                R.unique()
            );

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
        });
    }),
    R.filter(({ type }) => type !== "event")
);

function getFilters(trigger?: TriggerData | null): TriggerNodeFilter[] {
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

function getSchema<T extends NodeType>({ type, key }: { type: T; key: string }): NodeSchema {
    // @ts-expect-error
    return SCHEMAS[type][key];
}

function getEventKeys(): EventNodeKey[] {
    return R.keys(SCHEMAS.event);
}

function isNodeKey<T extends NodeType>(type: T, key: any): key is NodeKey<T> {
    return R.isString(key) && key in SCHEMAS[type];
}

function isFieldConnection(type: NodeEntryType | undefined): boolean {
    return !!type && FIELD_TYPES.includes(type);
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

type TriggerNodeFilter = {
    type: NodeType;
    key: string;
    inputs: ("boolean" | "item" | "uuid" | "text" | undefined)[];
    outputs: ("boolean" | "item" | "uuid" | "text" | undefined)[];
};

type EventNodeKey = keyof (typeof SCHEMAS)["event"];

export { getEventKeys, getFilters, getSchema, isFieldConnection, isNodeKey };
export type {
    EventNodeKey,
    ExtractNodeMap,
    ExtractPartialNodeMap,
    NodeKey,
    NodeSchemas,
    TriggerNodeFilter,
};
