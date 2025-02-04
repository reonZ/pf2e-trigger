import { openTriggerDialog } from "helpers/helpers-trigger-dialog";
import { BlueprintNode } from "../blueprint-node";

const EVENT_COLOR = 0xc40000;

abstract class EventBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return EVENT_COLOR;
    }

    get canDrag(): boolean {
        return false;
    }

    get context(): string[] {
        return ["convert"];
    }

    protected async _onContext(context: this["context"][number]) {
        if (context === "convert") {
            const trigger = this.blueprint.trigger;
            if (!trigger) return;

            const result = await openTriggerDialog("convert", trigger);
            if (!result) return;

            this.blueprint.convertTrigger(result.event);
        }
    }
}

interface EventBlueprintNode extends BlueprintNode {
    get key(): NodeEventKey;
}

export { EventBlueprintNode, EVENT_COLOR };
