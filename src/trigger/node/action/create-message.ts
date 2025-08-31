import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class CreateMessageTriggerNode extends TriggerNode<NodeSchemaOf<"action", "create-message">> {
    async execute(): Promise<boolean> {
        const target = await this.getTarget("target");
        const content = await this.get("message");
        const ChatMessage = getDocumentClass("ChatMessage");

        await ChatMessage.create({
            content,
            speaker: ChatMessage.getSpeaker(target),
        });

        return this.send("out");
    }
}

export { CreateMessageTriggerNode };
