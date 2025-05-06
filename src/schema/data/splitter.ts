import { NonBridgeEntryType } from "data";
import { NodeRawSchema } from "schema/schema";
import { booleanOutsSchema } from "./_utils";
import { NodeSchemaCustom } from "schema/model";

const EXTRACT_TYPES = [
    "boolean",
    "number",
    "text",
    "list",
    "target",
] as const satisfies NonBridgeEntryType[];

const boolean = {
    inputs: [{ key: "input", type: "boolean" }],
    outs: booleanOutsSchema(),
} as const satisfies NodeRawSchema;

const success = {
    inputs: [{ key: "input", type: "number" }],
    outs: [
        {
            key: "criticalFailure",
            label: "PF2E.Check.Result.Degree.Check.criticalFailure",
        },
        {
            key: "failure",
            label: "PF2E.Check.Result.Degree.Check.failure",
        },
        {
            key: "success",
            label: "PF2E.Check.Result.Degree.Check.success",
        },
        {
            key: "criticalSuccess",
            label: "PF2E.Check.Result.Degree.Check.criticalSuccess",
        },
    ],
} as const satisfies NodeRawSchema;

function createDocumentExtractor<T extends NonBridgeEntryType>(
    type: T
): DocumentExtractorSchema<T> {
    return {
        inputs: [{ key: "input", type }],
        custom: [
            {
                category: "outputs",
                types: EXTRACT_TYPES,
                key: { name: "path", required: true },
            },
        ],
    };
}

type DocumentExtractorSchema<T extends NonBridgeEntryType> = {
    inputs: [{ key: "input"; type: T }];
    custom: [NodeSchemaCustom];
};

export const splitter = {
    "actor-splitter": createDocumentExtractor("target"),
    "boolean-splitter": boolean,
    "item-splitter": createDocumentExtractor("item"),
    "success-splitter": success,
};
