import { TriggerHook } from "hook/hook";
import {
    ActorPF2e,
    ConditionSource,
    ItemPF2e,
    ItemSourcePF2e,
    R,
    createHook,
    setHasAny,
} from "module-helpers";

class ItemHook extends TriggerHook<
    "condition-gain" | "condition-lose" | "item-gain" | "item-lose"
> {
    #preUpdateItemHook = createHook("preUpdateItem", this.#onPreUpdateItem.bind(this));

    #createItemHook = this.createEventHook("createItem", this.#onCreateItem.bind(this));
    #updateItemHook = this.createEventHook("updateItem", this.#onUpdateItem.bind(this));
    #deleteItemHook = this.createEventHook("deleteItem", this.#onDeleteItem.bind(this));

    get events(): ["condition-gain", "condition-lose", "item-gain", "item-lose"] {
        return ["condition-gain", "condition-lose", "item-gain", "item-lose"];
    }

    get hasUpdate() {
        return this.triggers.some(
            (trigger) =>
                ["condition-gain", "condition-lose"].includes(trigger.event.key) &&
                trigger.event.inputs.update?.value !== false
        );
    }

    protected _activate(): void {
        this.#createItemHook.toggle("condition-gain", "item-gain");
        this.#deleteItemHook.toggle("condition-lose", "item-lose");
        this.#updateItemHook.toggle(this.hasUpdate);
    }

    protected _disable(): void {
        this.#createItemHook.disable();
        this.#deleteItemHook.disable();
        this.#updateItemHook.disable();
    }

    protected _activateAll(): void {
        this.#preUpdateItemHook.toggle(this.hasUpdate);
    }

    protected _disableAll(): void {
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
        const actor = item.actor;
        if (!this.isValidHookEvent(actor)) return;

        if (this.activeEvents.has("item-gain")) {
            this.executeEventTriggers("item-gain", {
                this: { actor },
                item,
            });
        }

        if (this.activeEvents.has("condition-gain") && item.isOfType("condition")) {
            this.executeEventTriggers("condition-gain", {
                this: { actor },
                condition: { slug: item.slug, update: false },
            });
        }
    }

    #onUpdateItem(
        item: ItemPF2e,
        data: DeepPartial<ItemSourcePF2e>,
        operation: DatabaseUpdateOperation<ActorPF2e>
    ) {
        const actor = item.actor;
        if (!this.isValidHookEvent(actor)) return;

        condition: if (
            setHasAny(this.activeEvents, "condition-gain", "condition-lose") &&
            item.isOfType("condition")
        ) {
            const difference = fu.getProperty(operation, "trigger.condition.difference");
            if (!R.isNumber(difference)) break condition;

            const options: PreTriggerExecuteOptions = {
                this: { actor },
                condition: { slug: item.slug, update: true },
            };

            if (difference > 0) {
                this.executeEventTriggers("condition-gain", options);
            } else if (difference < 0) {
                this.executeEventTriggers("condition-lose", options);
            }
        }
    }

    #onDeleteItem(item: ItemPF2e) {
        const actor = item.actor;
        if (!this.isValidHookEvent(actor)) return;

        if (this.activeEvents.has("item-lose")) {
            this.executeEventTriggers("item-lose", {
                this: { actor },
                item,
            });
        }

        if (this.activeEvents.has("condition-lose") && item.isOfType("condition")) {
            this.executeEventTriggers("condition-lose", {
                this: { actor },
                condition: { slug: item.slug, update: false },
            });
        }
    }
}

export { ItemHook };
