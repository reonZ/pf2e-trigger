import { createActionSchema } from "./schema-action";

const removeItemSchema = createActionSchema([{ key: "item", type: "item" }] as const);

export { removeItemSchema };
