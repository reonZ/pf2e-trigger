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

const booleanSplitter = {
    inputs: [{ key: "input", type: "boolean" }],
    outs: booleanOutsSchema(),
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
    "boolean-splitter": booleanSplitter,
    "item-splitter": createDocumentExtractor("item"),
    "string-list": {},
    "success-splitter": {},
};
