import { createActionEntry } from ".";

function removeItemAction() {
    return createActionEntry(
        "remove-item",
        "fa-solid fa-trash-xmark",
        [{ key: "item", type: "uuid" }] as const,
        async ({ actor }, options, cached) => {
            const item = cached.hasItem(actor, options.item);
            if (!item) return false;

            await item.delete();

            return true;
        }
    );
}

export { removeItemAction };

// class RemoveItemAction extends TriggerEventAction {
//     get type(): "remove-item" {
//         return "remove-item";
//     }

//     get icon(): string {
//         return "fa-solid fa-trash";
//     }

//     get options(): readonly TriggerInputEntry[] {
//         return [
//             {
//                 name: "item",
//                 type: "uuid",
//                 required: true,
//             },
//         ] as const satisfies Readonly<TriggerInputEntry[]>;
//     }

//     async execute(
//         target: TargetDocuments,
//         trigger: Trigger,
//         action: TriggerAction,
//         linkOption: TriggerInputValueType,
//         options: {},
//         cache: {}
//     ) {
//         if (!R.isString(action.options.item)) return false;

//         const item = findTriggerItem(target.actor, action.options.item);
//         if (!item) return false;

//         await item.delete();
//         return true;
//     }
// }

// export { RemoveItemAction };
