import { NodeSchema } from "@schema/schema";

type ActionSchema = Omit<NodeSchema, "isUnique" | "in"> & {
    in: true;
};

export type { ActionSchema };
