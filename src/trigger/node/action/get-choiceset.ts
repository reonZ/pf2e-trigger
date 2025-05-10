import { getChoiceSetSelection } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class GetChoicesetTriggerNode extends TriggerNode<NodeSchemaOf<"action", "get-choiceset">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");

        if (!item) {
            return this.send("out");
        }

        const selection = getChoiceSetSelection(item, {
            flag: await this.get("flag"),
            option: await this.get("option"),
        });

        if (selection) {
            this.setVariable("selection", selection);
        }

        return this.send("out");
    }
}

export { GetChoicesetTriggerNode };
