import { createAction } from "./schema-action";

const removeItemSchema = createAction([{ key: "item", type: "item" }] as const);

export { removeItemSchema };
