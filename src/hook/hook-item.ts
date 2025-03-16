import { TriggerHook } from "hook/hook";
import {
    ActorPF2e,
    ConditionSource,
    ItemPF2e,
    ItemSourcePF2e,
    R,
    createHook,
} from "module-helpers";

class ItemHook extends TriggerHook<"condition-gain" | "condition-lose"> {
    #preUpdateItemHook = createHook("preUpdateItem", this.#onPreUpdateItem.bind(this));

    #createItemHook = this.createEventHook("createItem", this.#onCreateItem.bind(this));
    #updateItemHook = this.createEventHook("updateItem", this.#onUpdateItem.bind(this));
    #deleteItemHook = this.createEventHook("deleteItem", this.#onDeleteItem.bind(this));

    get events(): ["condition-gain", "condition-lose"] {
        return ["condition-gain", "condition-lose"];
    }

    protected _activate(): void {
        this.#createItemHook.toggle("condition-gain");
        this.#deleteItemHook.toggle("condition-lose");
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
        operation: DatabaseUpdateOperation<ActorPF2e>
    ) {
        if (!this.isValidHookActor(item.actor)) return;

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
        const options = this.createHookOptions(item.actor);
        if (!options) return;

        if (item.isOfType("condition")) {
            options.condition = { slug: item.slug, update: false };
            this.executeEventTriggers("condition-gain", options);
        }
    }

    #onUpdateItem(
        item: ItemPF2e,
        data: DeepPartial<ItemSourcePF2e>,
        operation: DatabaseUpdateOperation<ActorPF2e>
    ) {
        const options = this.createHookOptions(item.actor);
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
        const options = this.createHookOptions(item.actor);
        if (!options) return;

        if (item.isOfType("condition")) {
            options.condition = { slug: item.slug, update: false };
            this.executeEventTriggers("condition-lose", options);
        }
    }
}

export { ItemHook };
