import { createActionSchema } from "./schema-action";

const consoleLogSchema = createActionSchema([]);

consoleLogSchema.inputs.pop();

export { consoleLogSchema };
