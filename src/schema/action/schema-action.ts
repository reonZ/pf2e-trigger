import { NodeSchema } from "schema/schema";

type ActionSchema = Omit<NodeSchema, "unique" | "in"> & {
    in: true;
};

export type { ActionSchema };
