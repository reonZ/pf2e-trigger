import { isInstanceOf } from "module-helpers";
import { createActionEntry } from ".";

function addItemAction() {
    return createActionEntry(
        "add-item",
        "fa-solid fa-square-plus",
        [{ key: "item", type: "uuid" }] as const,
        async ({ actor }, options) => {
            const item = await fromUuid(options.item);
            if (!isInstanceOf(item, "ItemPF2e")) return false;

            if (item.isOfType("feat") && item.maxTakable !== Infinity) {
                const exist = actor.itemTypes.feat.filter((x) => x.sourceId === options.item);
                if (exist.length >= item.maxTakable) return false;
            }

            const source = item.toObject();
            const newItem = await actor.createEmbeddedDocuments("Item", [source]);

            return !!newItem;
        }
    );
}

export { addItemAction };
