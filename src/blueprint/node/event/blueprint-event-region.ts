import { info } from "module-helpers";
import { EventBlueprintNode } from "./blueprint-event";

class RegionEventBlueprintNode extends EventBlueprintNode {
    get icon(): string {
        return "\uf867";
    }

    get context(): string[] {
        return ["copy-id", ...super.context];
    }

    async _onContext(context: string): Promise<void> {
        switch (context) {
            case "copy-id": {
                game.clipboard.copyPlainText(this.trigger.id);
                return info(`${this.localizePath}.copied`);
            }

            default: {
                return super._onContext(context);
            }
        }
    }
}

export { RegionEventBlueprintNode };
