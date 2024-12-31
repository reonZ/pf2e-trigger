import { createActionEntry } from ".";

function removeItemAction() {
    return createActionEntry(
        "remove-item",
        "fa-solid fa-trash-xmark",
        [{ key: "item", type: "uuid" }] as const,
        async ({ actor }, options, cached) => {
            const item = cached.hasItem(actor, options.item);
            if (!item) return false;

            const removed = await item.delete();
            return !!removed;
        }
    );
}

export { removeItemAction };
