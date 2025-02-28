import { itemSplitterSchema } from "schema/splitter/schema-splitter-item";
import { TriggerNode } from "../trigger-node";
import { R } from "module-helpers";

class ItemTriggerSplitter extends TriggerNode<typeof itemSplitterSchema> {
    async execute(): Promise<void> {
        const input = await this.get("input");

        if (input) {
            this.setVariable("name", input.name);
            this.setVariable("slug", input.slug ?? game.pf2e.system.sluggify(input.name));
            this.setVariable(
                "level",
                "level" in input && R.isNumber(input.level) ? input.level : 0
            );
        }

        this.send("out");
    }
}

export { ItemTriggerSplitter };
