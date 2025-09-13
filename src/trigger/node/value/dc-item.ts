import { NodeSchemaOf } from "schema";
import { TriggerDcEntry, TriggerNode } from "trigger";

class DcItemTriggerNode extends TriggerNode<NodeSchemaOf<"value", "dc-item">> {
    async query(): Promise<TriggerDcEntry> {
        const target = await this.get("origin");
        const description = (await this.get("item"))?.description;

        if (!description) {
            return { scope: "check", target, value: 0 };
        }

        const nb = await this.get("nb");
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

        return { scope: "check", target, value };
    }
}

export { DcItemTriggerNode };
