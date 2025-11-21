import { primaryPlayerOwner, R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode, USER_QUERY_TIMEOUT } from "trigger";

class AwaitConfirmTriggerNode extends TriggerNode<NodeSchemaOf<"action", "await-confirm">> {
    async execute(): Promise<boolean> {
        const actor = await this.getTargetActor("target");

        if (!actor) {
            return this.send("false");
        }

        const user = primaryPlayerOwner(actor) ?? game.user;

        const data: UserQueryPromptData = {
            action: "await-prompt",
            prompt: (await this.getLocalizedText("prompt")) || "???",
            title: (await this.getLocalizedText("title")) || this.trigger.label,
        };

        const result = await this.userQuery<boolean | null>(user, data);
        return R.isBoolean(result) ? this.send(result) : false;
    }
}

async function confirmPrompt(data: UserQueryPromptData): Promise<boolean | null> {
    return foundry.applications.api.DialogV2.confirm({
        content: data.prompt,
        no: {
            label: "Cancel",
        },
        render: (event, dialog) => {
            setTimeout(() => dialog.close(), USER_QUERY_TIMEOUT);
        },
        window: {
            title: data.title,
        },
        yes: {
            label: "Confirm",
        },
    });
}

type UserQueryPromptData = {
    action: "await-prompt";
    prompt: string;
    title: string;
};

export { AwaitConfirmTriggerNode, confirmPrompt };
export type { UserQueryPromptData };
