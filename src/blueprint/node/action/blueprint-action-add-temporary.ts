import { getTriggerOption } from "helpers/helpers-effect";
import { info } from "module-helpers";
import { ActionBlueprintNode } from "./blueprint-action";

class AddTemporartyBlueprintNode extends ActionBlueprintNode {
    get icon(): PreciseText {
        return this.fontAwesomeIcon("\uf017", { fontWeight: "900" });
    }

    get context(): string[] {
        return ["copy-option", ...super.context];
    }

    get slug(): string {
        return (this.data.inputs.slug?.value ?? "") as string;
    }

    protected async _onContext(context: string): Promise<void> {
        switch (context) {
            case "copy-option": {
                const slug = getTriggerOption(this.trigger, this.slug);
                game.clipboard.copyPlainText(slug);
                return info(`${this.localizePath}.copied`);
            }

            default: {
                return super._onContext(context);
            }
        }
    }
}

export { AddTemporartyBlueprintNode };
