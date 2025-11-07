import { ChatMessagePF2e, getFirstActiveToken } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SendToChatTriggerNode extends TriggerNode<NodeSchemaOf<"action", "send-to-chat">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");

        if (!item?.parent) {
            return this.send("out");
        }

        const targeting = await this.get("targeting");
        const target = targeting ? targeting.token ?? getFirstActiveToken(targeting.actor) : null;

        if (target) {
            Hooks.once("preCreateChatMessage", (message: ChatMessagePF2e) => {
                message.updateSource({ "flags.pf2e-toolbelt.targetHelper.targets": [target.uuid] });
            });
        }

        await item.toMessage();

        return this.send("out");
    }
}

export { SendToChatTriggerNode };
