import { NodeSchemaOf } from "schema";
import { TriggerDcEntry, TriggerNode } from "trigger";

class DcItemTriggerNode extends TriggerNode<NodeSchemaOf<"value", "dc-item">> {
    async query(): Promise<TriggerDcEntry> {
        const target = await this.get("origin");
        const item = await this.get("item");

        if (!item) {
            return { scope: "check", target, value: 0 };
        }

        const nb = await this.get("nb");
        const description = item.description;
        const regex = /@Check\[(?=.*\b(will|reflex|fortitude)\b).*?(dc:(?<dc>\d+)).*?\]/gm;

        let count = 0;
        let value: number = 0;
        let match: RegExpExecArray | null = null;

        while ((match = regex.exec(description)) !== null) {
            const dc = Number(match.groups?.dc);

            if (!value) {
                value = dc;
            }

            if (++count >= nb) {
                value = dc;
                break;
            }
        }

        return {
            label: game.i18n.format("PF2E.InlineCheck.DCWithName", { name: item.name }),
            scope: "check",
            target,
            value,
        };
    }
}

export { DcItemTriggerNode };
