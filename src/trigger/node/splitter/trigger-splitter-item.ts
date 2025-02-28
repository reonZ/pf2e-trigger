import { itemSplitterSchema } from "schema/splitter/schema-splitter-item";
import { TriggerNode } from "../trigger-node";
import { R } from "module-helpers";

class ItemTriggerSplitter extends TriggerNode<typeof itemSplitterSchema> {
    async execute(): Promise<void> {
        const item = await this.get("item");

        if (item) {
            this.setVariable("name", item.name);
            this.setVariable("slug", item.slug ?? game.pf2e.system.sluggify(item.name));
            this.setVariable("level", "level" in item && R.isNumber(item.level) ? item.level : 0);
        }

        this.send("out");
    }
}

export { ItemTriggerSplitter };
