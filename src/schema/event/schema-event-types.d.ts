import { eventSchema } from "./schema-event";

declare global {
    type EventSchema = {
        unique: string[] | boolean;
        inputs?: NodeSchemaInput[];
        outs: [{ key: "out" }];
        variables: [{ key: "this"; type: "target" }, ...NodeSchemaVariable[]];
    };
}
