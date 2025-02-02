import { MacroPF2e, R } from "module-helpers";
import { ExtractSchemaOuputsKeys } from "schema/schema";
import { macroSourceSchema } from "schema/value/schema-macro-source";
import { TriggerNode } from "../trigger-node";

class MacroSourceTriggerNode extends TriggerNode<typeof macroSourceSchema> {
    #cached: MacroPF2e | null | undefined = undefined;

    protected async _query(
        key: ExtractSchemaOuputsKeys<typeof macroSourceSchema>
    ): Promise<MacroPF2e | undefined> {
        if (this.#cached === undefined) {
            const uuid = await this.get("uuid");
            const macro = R.isString(uuid) && uuid.trim() ? await fromUuid<MacroPF2e>(uuid) : null;

            this.#cached = macro instanceof Macro && macro.type === "script" ? macro : null;
        }

        return this.#cached ?? undefined;
    }
}

export { MacroSourceTriggerNode };
