import { splitListString } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class ExtractFormulaTriggerNode extends TriggerNode<NodeSchemaOf<"action", "extract-formula">> {
    async execute(): Promise<boolean> {
        const item = await this.get("item");

        if (!item) {
            return this.send("out");
        }

        const nb = await this.get("nb");
        const description = item.description;
        const regex = /@Damage\[((?:[^[\]]|\[[^[\]]*\])*)\]/gm;

        let count = 0;
        let match: RegExpExecArray | null = null;

        while ((match = regex.exec(description)) !== null) {
            const params = parseInlineParams(match[1], { first: "formula" });

            if (++count >= nb) {
                this.setVariable("formula", params.formula ?? "");
                this.setVariable("options", params.options ?? "");
                this.setVariable("traits", params.traits ?? "");
                break;
            }
        }

        return this.send("out");
    }
}

/**
 * https://github.com/foundryvtt/pf2e/blob/a4049bd76dab59cb992e77b8c5c447d793940a85/src/module/system/text-editor.ts#L335
 */
function parseInlineParams(
    paramString: string,
    options: { first?: string } = {}
): Record<string, string | undefined> {
    const parts = splitListString(paramString, { delimiter: "|" });
    const result = parts.reduce((result, part, idx) => {
        if (idx === 0 && options.first && !part.includes(":")) {
            result[options.first] = part.trim();
            return result;
        }

        const colonIdx = part.indexOf(":");
        const portions =
            colonIdx >= 0 ? [part.slice(0, colonIdx), part.slice(colonIdx + 1)] : [part, ""];
        result[portions[0]] = portions[1];

        return result;
    }, {} as Record<string, string | undefined>);

    return result;
}

export { ExtractFormulaTriggerNode };
