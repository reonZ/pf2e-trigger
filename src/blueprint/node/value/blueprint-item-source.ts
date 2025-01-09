import { ItemSourceValueTriggerNode } from "@node/value/item-source";
import { ValueBlueprintNode } from "./blueprint-value";
import { ItemPF2e, R, isItemEntry } from "module-helpers";

class ItemSourceValueBlueprintNode extends ValueBlueprintNode {
    get title(): string | null {
        const item = this.item;
        return item?.name || super.title;
    }

    get icon(): string | PIXI.Sprite | null {
        const item = this.item;
        return item === null ? "\uf127" : item ? PIXI.Sprite.from(item.img) : super.icon;
    }

    get item(): ItemPF2e | CompendiumIndexData | undefined | null {
        const value = this.trigger.getValue("inputs", "uuid");
        if (!R.isString(value) || !value.trim()) return;

        const item = fromUuidSync<ItemPF2e>(value);
        if (item instanceof Item && item.sourceId !== value) return null;

        return isItemEntry(item) ? item : null;
    }
}

interface ItemSourceValueBlueprintNode extends ValueBlueprintNode {
    get trigger(): ItemSourceValueTriggerNode;
}

export { ItemSourceValueBlueprintNode };
