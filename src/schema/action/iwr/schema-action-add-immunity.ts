import { createAddIwrSchema } from "./schema-action-add-iwr";

const addImmunitySchema = createAddIwrSchema("CONFIG.PF2E.immunityTypes");

// @ts-expect-error
addImmunitySchema.inputs.shift();

export { addImmunitySchema };
