import { getFirstActiveToken } from "module-helpers";
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
        const message = await item.toMessage(null, { create: !target });

        if (target && message) {
            const source = message?.toObject() as ChatMessageCreateData<ChatMessage>;

            foundry.utils.setProperty(source, "flags.pf2e-toolbelt.targetHelper.targets", [
                target.uuid,
            ]);

            await getDocumentClass("ChatMessage").create(source);
        }

        return this.send("out");
    }
}

export { SendToChatTriggerNode };
