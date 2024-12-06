import { R } from "module-helpers";
import {
    Trigger,
    TriggerAction,
    TriggerInputEntry,
    TriggerInputValueType,
    findTriggerItem,
} from "../trigger";
import { TriggerEventAction } from "./base";

class RemoveItemAction extends TriggerEventAction {
    get type(): "remove-item" {
        return "remove-item";
    }

    get icon(): string {
        return "fa-solid fa-trash";
    }

    get options(): readonly TriggerInputEntry[] {
        return [
            {
                name: "item",
                type: "uuid",
                required: true,
            },
        ] as const satisfies Readonly<TriggerInputEntry[]>;
    }

    async execute(
        target: TargetDocuments,
        trigger: Trigger,
        action: TriggerAction,
        linkOption: TriggerInputValueType,
        options: {},
        cache: {}
    ) {
        if (!R.isString(action.options.item)) return false;

        const item = findTriggerItem(target.actor, action.options.item);
        if (!item) return false;

        await item.delete();
        return true;
    }
}

export { RemoveItemAction };
