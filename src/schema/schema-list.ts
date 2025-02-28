import { R } from "module-helpers";
import { addImmunitySchema } from "./action/iwr/schema-action-add-immunity";
import { addResistanceSchema } from "./action/iwr/schema-action-add-resistance";
import { addWeaknessSchema } from "./action/iwr/schema-action-add-weakness";
import { removeImmunitySchema } from "./action/iwr/schema-action-remove-immunity";
import { addConditionSchema } from "./action/schema-action-add-condition";
import { addItemSchema } from "./action/schema-action-add-item";
import { addPersistentSchema } from "./action/schema-action-add-persistent";
import { addTemporarySchema } from "./action/schema-action-add-temporary";
import { consoleLogSchema } from "./action/schema-action-console-log";
import { removeItemSchema } from "./action/schema-action-remove-item";
import { removeTemporarySchema } from "./action/schema-action-remove-temporary";
import { rollDamageSchema } from "./action/schema-action-roll-damage";
import { rollSaveSchema } from "./action/schema-action-roll-save";
import { hasItemSchema } from "./condition/schema-condition-has-item";
import { hasOptionsSchema } from "./condition/schema-condition-has-option";
import { hasTemporarySchema } from "./condition/schema-condition-has-temporary";
import { insideAuraSchema } from "./condition/schema-condition-inside-aura";
import { eventSchema } from "./event/schema-event";
import { auraEventSchema } from "./event/schema-event-aura";
import { createLogicSchema } from "./logic/schema-logic";
import { macroSchema } from "./macro/schema-macro";
import { booleanSplitterSchema } from "./splitter/schema-splitter-boolean";
import { successSplitterSchema } from "./splitter/schema-splitter-success";
import { subtriggerSchema } from "./subtrigger/schema-subtrigger";
import { outputSubtriggerSchema } from "./subtrigger/schema-subtrigger-output";
import { dcValueSchema } from "./value/schema-value-dc";
import { dcTargetSchema } from "./value/schema-value-dc-target";
import { simpleDurationSchema } from "./value/schema-value-duration-simple";
import { unitDurationSchema } from "./value/schema-value-duration-unit";
import { itemSourceSchema } from "./value/schema-value-item-source";
import { createValueSchema } from "./value/schema-value-primitive";
import { rollDataSchema } from "./value/schema-value-roll-data";
import { successValueSchema } from "./value/schema-value-success";
import { reduceConditionSchema } from "./action/schema-action-reduce-condition";
import { itemSplitterSchema } from "./splitter/schema-splitter-item";

const NO_CONNECTOR_TYPES = ["event", "value"] as NodeType[];

const SCHEMAS = {
    action: {
        "add-item": addItemSchema,
        "add-condition": addConditionSchema,
        "reduce-condition": reduceConditionSchema,
        "add-persistent": addPersistentSchema,
        "remove-item": removeItemSchema,
        "roll-save": rollSaveSchema,
        "roll-damage": rollDamageSchema,
        "console-log": consoleLogSchema,
        "add-immunity": addImmunitySchema,
        "remove-immunity": removeImmunitySchema,
        "add-temporary": addTemporarySchema,
        "remove-temporary": removeTemporarySchema,
        "add-resistance": addResistanceSchema,
        "add-weakness": addWeaknessSchema,
    },
    condition: {
        "has-item": hasItemSchema,
        "has-option": hasOptionsSchema,
        "inside-aura": insideAuraSchema,
        "has-temporary": hasTemporarySchema,
    },
    converter: {
        // "item-converter": itemConverterSchema,
    },
    event: {
        "turn-start": eventSchema,
        "turn-end": eventSchema,
        "token-create": eventSchema,
        "token-delete": eventSchema,
        "test-event": eventSchema,
        "aura-enter": auraEventSchema,
        "aura-leave": auraEventSchema,
        "execute-event": eventSchema,
        "region-event": eventSchema,
    },
    logic: {
        "eq-number": createLogicSchema("number"),
        "gt-number": createLogicSchema("number"),
        "lt-number": createLogicSchema("number"),
        "gte-number": createLogicSchema("number"),
        "lte-number": createLogicSchema("number"),
    },
    macro: {
        macro: macroSchema,
    },
    splitter: {
        "success-splitter": successSplitterSchema,
        "boolean-splitter": booleanSplitterSchema,
        "item-splitter": itemSplitterSchema,
    },
    subtrigger: {
        "subtrigger-input": eventSchema,
        "subtrigger-output": outputSubtriggerSchema,
        "subtrigger-node": subtriggerSchema,
    },
    value: {
        "number-value": createValueSchema("number"),
        "text-value": createValueSchema("text"),
        "item-source": itemSourceSchema,
        "roll-data": rollDataSchema,
        "dc-value": dcValueSchema,
        "dc-target": dcTargetSchema,
        "duration-simple": simpleDurationSchema,
        "duration-unit": unitDurationSchema,
        "success-value": successValueSchema,
    },
    variable: {
        variable: {},
    },
} satisfies Record<NodeType, Record<string, NodeRawSchema>>;

const FILTERS: NodeSchemaFilter[] = R.pipe(
    R.entries(SCHEMAS),
    R.filter(([type]) => !["event", "subtrigger", "variable"].includes(type)),
    R.flatMap(([type, schemas]) => {
        return R.pipe(
            R.entries(schemas),
            R.map(([key]: [string, NodeRawSchema]): NodeSchemaFilter => {
                const schema = getSchema({ type, key });

                const inputs: NodeEntryType[] = R.pipe(
                    (schema.inputs ?? []) as NodeSchemaInput[],
                    R.filter((input) => inputHasConnector(input, type)),
                    R.map((input) => ("type" in input ? input.type : undefined)),
                    R.unique()
                );

                const outputs = R.pipe(
                    schema.outputs,
                    R.map((output) => ("type" in output ? output.type : undefined)),
                    R.unique()
                );

                return {
                    type,
                    key,
                    inputs,
                    outputs,
                    unique: !!schema.unique,
                };
            })
        );
    })
);

function inputHasConnector(input: NodeSchemaInput, type: NodeType) {
    return input.connection !== false && !NO_CONNECTOR_TYPES.includes(type);
}

function getFilters(trigger?: TriggerData | null): NodeSchemaFilter[] {
    if (trigger?.isSub) {
        return FILTERS.filter(({ unique }) => !unique);
    }

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

    return FILTERS.filter(({ key }) => !uniques.includes(key));
}

function getSchema(data: WithRequired<Partial<NodeData>, "type" | "key">): NodeSchema {
    // @ts-expect-error
    const rawSchema = foundry.utils.deepClone(SCHEMAS[data.type][data.key]) as NodeRawSchema;

    const outs = rawSchema.outs ?? [];
    const variables = rawSchema.variables ?? [];
    const schema: NodeSchema = {
        unique: R.isArray(rawSchema.unique) ? rawSchema.unique : !!rawSchema.unique,
        inputs: (rawSchema.inputs ?? []) as NodeSchemaInputs,
        outputs: [...outs, ...variables],
        variables,
    };

    if (rawSchema.in) {
        schema.inputs.unshift({ key: "in" });
    }

    if (data.custom) {
        schema.inputs.push(...data.custom.inputs);
        schema.outputs.push(...data.custom.outputs);
    }

    return schema;
}

function getSubtriggerSchema(data: TriggerData): NodeSchema {
    const schema = getSchema({ type: "subtrigger", key: "subtrigger-node" });

    const outputNode = R.values(data.nodes).find(
        (node) => node.type === "subtrigger" && node.key !== "subtrigger-input"
    );

    return {
        ...schema,
        inputs: [{ key: "in" }, ...data.event.custom.outputs] as NodeSchemaInputs,
        outputs: [...schema.outputs, ...(outputNode?.custom.inputs ?? [])],
    };
}

function getEventKeys(): NodeEventKey[] {
    return R.keys(SCHEMAS.event);
}

function isNodeKey<T extends NodeType>(type: T, key: any): key is NodeKey<T> {
    return R.isString(key) && (["subtrigger"].includes(type) || key in SCHEMAS[type]);
}

export {
    SCHEMAS,
    getEventKeys,
    getFilters,
    getSchema,
    getSubtriggerSchema,
    inputHasConnector,
    isNodeKey,
};
