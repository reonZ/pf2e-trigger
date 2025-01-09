import { ItemSourceValueTriggerNode } from "@node/value/item-source";
import { ValueBlueprintNode } from "./blueprint-value";

class ItemSourceValueBlueprintNode extends ValueBlueprintNode {
    get title(): string | null {
        const item = this.trigger.item;
        return item?.name || super.title;
    }

    get icon(): string | PIXI.Sprite | null {
        const item = this.trigger.item;
        return item === null ? "\uf127" : item ? PIXI.Sprite.from(item.img) : super.icon;
    }
}

interface ItemSourceValueBlueprintNode extends ValueBlueprintNode {
    get trigger(): ItemSourceValueTriggerNode;
}

export { ItemSourceValueBlueprintNode };
