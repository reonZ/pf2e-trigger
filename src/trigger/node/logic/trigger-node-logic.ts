import { LogicSchema } from "schema/logic/schema-logic";
import { ExtractSchemaEntryType, NonNullableNodeEntryType } from "schema/schema";
import { ItemPF2e, MacroPF2e } from "module-helpers";

type ExtractInValueType<S extends LogicSchema> = S["inputs"][0] extends {
    type: infer T extends NonNullableNodeEntryType;
}
    ? ExtractSchemaEntryType<T>
    : S["inputs"][0] extends {
          type: "item";
      }
    ? ItemPF2e
    : S["inputs"][0] extends {
          type: "macro";
      }
    ? MacroPF2e
    : never;

export type { ExtractInValueType };
