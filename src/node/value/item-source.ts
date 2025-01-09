import { NodeSchema } from "@node/trigger-node";
import { ValueTriggerNode } from "./value";
import { ItemPF2e, R, isItemEntry } from "module-helpers";

class ItemSourceValueTriggerNode extends ValueTriggerNode {
    get schema(): NodeSchema {
        return {
            inputs: [{ key: "uuid", type: "uuid" }],
            outputs: [{ key: "item", type: "item" }],
        };
    }

    get item(): ItemPF2e | CompendiumIndexData | undefined | null {
        const value = this.getValue("inputs", "uuid");
        if (!R.isString(value) || !value.trim()) return;

        const item = fromUuidSync<ItemPF2e>(value);
        if (item instanceof Item && item.sourceId !== value) return null;

        return isItemEntry(item) ? item : null;
    }
}

export { ItemSourceValueTriggerNode };
