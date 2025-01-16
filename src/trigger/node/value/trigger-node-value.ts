import {
    ExtractSchemaEntryType,
    ExtractSchemaInputsKeys,
    NonNullableNodeEntryType,
} from "@schema/schema";
import { ValueSchema } from "@schema/value/value-schema";
import { TriggerExecuteOptions } from "@trigger/trigger";
import { ActorPF2e, ItemPF2e } from "module-helpers";
import { TriggerNode, TriggerNodeEntryValue } from "../trigger-node";

abstract class ValueTriggerNode<TSchema extends ValueSchema> extends TriggerNode<TSchema> {
    // actor uuid
    #values: Record<string, ExtractValueType<TSchema> | null> = {};

    protected abstract _computeValue(
        origin: TargetDocuments,
        options: TriggerExecuteOptions
    ): Promise<ExtractValueType<TSchema> | null>;

    protected async _query(
        key: ExtractSchemaInputsKeys<TSchema>,
        origin: TargetDocuments,
        options: TriggerExecuteOptions
    ): Promise<TriggerNodeEntryValue> {
        const { actor } = origin;

        if (actor.uuid in this.#values) {
            return this.#values[actor.uuid] ?? undefined;
        }

        return (this.#values[actor.uuid] = await this._computeValue(origin, options)) ?? undefined;
    }
}

type ExtractValueType<S extends ValueSchema> = S["outputs"][0] extends {
    type: infer T extends NonNullableNodeEntryType;
}
    ? ExtractSchemaEntryType<T>
    : S["outputs"][0] extends {
          type: "item";
      }
    ? ItemPF2e<ActorPF2e>
    : never;

export { ValueTriggerNode };
export type { ExtractValueType };
