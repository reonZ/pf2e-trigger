import { LogicSchema } from "schema/logic/schema-logic";
import { ExtractSchemaEntryType, NodeEntryType } from "schema/schema";

type ExtractInValueType<S extends LogicSchema> = S["inputs"][0] extends {
    type: infer T extends NodeEntryType;
}
    ? ExtractSchemaEntryType<T>
    : never;

export type { ExtractInValueType };
