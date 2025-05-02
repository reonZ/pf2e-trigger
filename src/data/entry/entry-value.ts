import { R } from "module-helpers";
import fields = foundry.data.fields;

class NodeEntryValueField<
    TSourceProp extends NodeEntryValue = NodeEntryValue,
    TRequired extends boolean = false,
    TNullable extends boolean = false,
    THasInitial extends boolean = false
> extends fields.DataField<TSourceProp, TSourceProp, TRequired, TNullable, THasInitial> {
    static get _defaults() {
        return Object.assign(super._defaults, {
            validationError: "is not a valid Node Entry Value string",
        });
    }

    protected _cast(value?: unknown): unknown {
        if (R.isNumber(value) || R.isBoolean(value)) {
            return value;
        }

        if (R.isString(value)) {
            const numbered = Number(value);
            return isNaN(numbered) ? value : numbered;
        }

        return undefined;
    }
}

type NodeEntryValue = string | number | boolean | undefined;

export { NodeEntryValueField };
export type { NodeEntryValue };
