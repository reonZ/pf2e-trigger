import { ItemPF2e, R, isItemEntry } from "module-helpers";
import { ValueBlueprintNode } from "./blueprint-value-node";

class ItemSourceBlueprintNode extends ValueBlueprintNode {
    #item: Maybe<ItemPF2e | CompendiumIndexData>;

    get title(): string | null {
        const item = this.item;
        return item?.name || super.title;
    }

    get icon(): string | PIXI.Sprite | null {
        const item = this.item;
        return item === null ? "\uf127" : item ? PIXI.Sprite.from(item.img) : super.icon;
    }

    get item(): Maybe<ItemPF2e | CompendiumIndexData> {
        return this.#item;
    }

    initialize(): void {
        this.#item = this.#getItem();
        super.initialize();
    }

    #getItem(): Maybe<ItemPF2e | CompendiumIndexData> {
        const value = this.getValue("inputs", "uuid");
        if (!R.isString(value) || !value.trim()) return;

        const item = fromUuidSync<ItemPF2e>(value);
        if (item instanceof Item && item.sourceId !== value) return null;

        return isItemEntry(item) ? item : null;
    }
}

export { ItemSourceBlueprintNode };
