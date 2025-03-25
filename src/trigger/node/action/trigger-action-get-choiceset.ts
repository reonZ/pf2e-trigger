import { getChoicesetSchema } from "schema/action/schema-action-get-choiceset";
import { TriggerNode } from "../trigger-node";
import { getChoiceSetSelection } from "module-helpers";

class GetChoicesetTriggerAction extends TriggerNode<typeof getChoicesetSchema> {
    async execute(): Promise<void> {
        const item = await this.get("item");

        if (!item) {
            return this.send("out");
        }

        const flag = (await this.get("flag")).trim();
        const option = (await this.get("option")).trim();
        const selection = getChoiceSetSelection(item, { flag, option });

        if (selection) {
            this.setVariable("selection", selection);
        }

        return this.send("out");
    }
}

export { GetChoicesetTriggerAction };
