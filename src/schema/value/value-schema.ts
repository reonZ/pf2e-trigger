import { NodeSchemaInputEntry, NodeSchemaOutputEntry } from "@schema/schema";

type ValueSchema = {
    inputs?: NodeSchemaInputEntry[];
    outputs: WithRequired<NodeSchemaOutputEntry, "type">[];
};

export type { ValueSchema };
