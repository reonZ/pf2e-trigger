import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SendToChatTriggerNode extends TriggerNode<NodeSchemaOf<"action", "send-to-chat">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");

        if (!item?.parent) {
            return this.send("out");
        }

        const targets = await this.getCustomTargets();
        const message = await item.toMessage(null, { create: !targets.length });

        if (targets.length && message) {
            const source = message?.toObject() as ChatMessageCreateData<ChatMessage>;

            foundry.utils.setProperty(source, "flags.pf2e-toolbelt.targetHelper.targets", targets);
            await getDocumentClass("ChatMessage").create(source);
        }

        return this.send("out");
    }
}

export { SendToChatTriggerNode };
