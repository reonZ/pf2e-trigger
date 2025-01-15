import { NodeSchema, NodeSchemaOutputEntry } from "@schema/schema";

type ConditionSchema = Omit<NodeSchema, "in" | "outputs"> & {
    in: true;
    outputs: Omit<NodeSchemaOutputEntry, "type">[];
};

export type { ConditionSchema };
