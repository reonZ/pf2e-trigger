import { BlueprintSelectMenu } from "blueprint/menu/blueprint-select-menu";
import { BlueprintNode } from "../blueprint-node";
import { openAddTriggerDialog } from "helpers/helpers-add-trigger";

const CONTEXT = ["convert"] as const;

abstract class EventBlueprintNode extends BlueprintNode {
    get headerColor(): number {
        return 0xc40000;
    }

    get canDrag(): boolean {
        return false;
    }

    protected async _onContextMenu(event: PIXI.FederatedPointerEvent): Promise<void> {
        const { x, y } = event.global;
        const context = await BlueprintSelectMenu.open(this.blueprint, { x, y }, CONTEXT);

        if (context === "convert") {
            const result = await openAddTriggerDialog(this.trigger, true);
            if (!result) return;

            this.blueprint.convertTrigger(result.event);
        }
    }
}

export { EventBlueprintNode };
