import { itemSplitterSchema } from "schema/splitter/schema-splitter-item";
import { TriggerNode } from "../trigger-node";
import { R } from "module-helpers";

class ItemTriggerSplitter extends TriggerNode<typeof itemSplitterSchema> {
    async execute(): Promise<void> {
        const item = await this.get("item");
        const level = item && "level" in item && R.isNumber(item.level) ? item.level : 0;

        this.setVariable("name", item?.name ?? "");
        this.setVariable("uuid", item?.uuid ?? "");
        this.setVariable("slug", item ? item.slug ?? game.pf2e.system.sluggify(item.name) : "");
        this.setVariable("level", level);

        this.send("out");
    }
}

export { ItemTriggerSplitter };
