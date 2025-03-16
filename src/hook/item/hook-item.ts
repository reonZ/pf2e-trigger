import { TriggerHook } from "hook/hook";
import {
    ActorPF2e,
    ConditionSource,
    ItemPF2e,
    ItemSourcePF2e,
    R,
    createHook,
    userIsActiveGM,
} from "module-helpers";

class ItemHook extends TriggerHook {
    #preUpdateItemHook = createHook("preUpdateItem", this.#onPreUpdateItem.bind(this));

    #createItemHook = createHook("createItem", this.#onCreateItem.bind(this));
    #updateItemHook = createHook("updateItem", this.#onUpdateItem.bind(this));
    #deleteItemHook = createHook("deleteItem", this.#onDeleteItem.bind(this));

    get events(): ["condition-gain", "condition-lose"] {
        return ["condition-gain", "condition-lose"];
    }

    protected _activate(): void {
        this.#createItemHook.toggle(this.activeEvents.has("condition-gain"));
        this.#deleteItemHook.toggle(this.activeEvents.has("condition-lose"));
        this.#updateItemHook.activate();
    }

    protected _disable(): void {
        this.#createItemHook.disable();
        this.#deleteItemHook.disable();
        this.#updateItemHook.disable();
    }

    _activateAll(): void {
        this.#preUpdateItemHook.activate();
    }

    _disableAll(): void {
        this.#preUpdateItemHook.disable();
    }

    #onPreUpdateItem(
        item: ItemPF2e,
        data: DeepPartial<ItemSourcePF2e>,
        operation: DatabaseUpdateOperation<ItemPF2e>
    ) {
        if (!isValidPreHook(item)) return;

        condition: if (item.isOfType("condition")) {
            const newValue = (data as DeepPartial<ConditionSource>).system?.value?.value;
            if (newValue == null) break condition;

            const currentValue = item.value ?? 1;
            const difference = newValue - currentValue;

            if (difference !== 0) {
                fu.setProperty(operation, "trigger.condition.difference", difference);
            }
        }
    }

    #onCreateItem(item: ItemPF2e) {
        const options = getHookOptions(item);
        if (!options) return;

        if (item.isOfType("condition")) {
            options.condition = { slug: item.slug, update: false };
            this.executeEventTriggers("condition-gain", options);
        }
    }

    #onUpdateItem(
        item: ItemPF2e,
        data: DeepPartial<ItemSourcePF2e>,
        operation: DatabaseUpdateOperation<ItemPF2e>
    ) {
        const options = getHookOptions(item);
        if (!options) return;

        condition: if (item.isOfType("condition")) {
            const difference = fu.getProperty(operation, "trigger.condition.difference");
            if (!R.isNumber(difference)) break condition;

            options.condition = { slug: item.slug, update: true };

            if (difference > 0) {
                this.executeEventTriggers("condition-gain", options);
            } else if (difference < 0) {
                this.executeEventTriggers("condition-lose", options);
            }
        }
    }

    #onDeleteItem(item: ItemPF2e) {
        const options = getHookOptions(item);
        if (!options) return;

        if (item.isOfType("condition")) {
            options.condition = { slug: item.slug, update: false };
            this.executeEventTriggers("condition-lose", options);
        }
    }
}

function isValidPreHook(item: ItemPF2e): item is ItemPF2e<ActorPF2e> {
    const actor = item.actor;
    return !!actor && !actor.pack;
}

function getHookOptions(item: ItemPF2e): PreTriggerExecuteOptions | undefined {
    if (!userIsActiveGM()) return;

    const actor = item.actor;
    if (!actor || actor.pack) return;

    return {
        this: { actor },
    };
}

export { ItemHook };
