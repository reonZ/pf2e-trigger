import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { BlueprintNode } from "../blueprint-node";
import { makeCustomNode } from "../blueprint-node-custom";
import { EVENT_COLOR } from "../event/blueprint-event";
import { R } from "module-helpers";
import { segmentEntryId } from "data/data-entry";

abstract class EventSubtriggerBlueprintNode extends makeCustomNode(BlueprintNode) {
    get headerColor(): number {
        return EVENT_COLOR;
    }

    removeEntry(entry: BlueprintEntry): void {
        const triggerId = entry.blueprint.trigger!.id;
        const oppositeCategory = entry.oppositeCategory;

        for (const trigger of this.blueprint.triggers) {
            if (trigger.isSub) continue;

            for (const node of R.values(trigger.nodes)) {
                if (node.subId !== triggerId) continue;

                const entryId = `${node.id}.${oppositeCategory}.${entry.key}`;

                for (const targetId of node[oppositeCategory][entry.key]?.ids ?? []) {
                    const { nodeId, category, key } = segmentEntryId(targetId);
                    trigger.nodes[nodeId]?.[category][key]?.ids?.findSplice((x) => x === entryId);
                }

                delete node[oppositeCategory][entry.key];
            }
        }

        super.removeEntry(entry);
    }
}

export { EventSubtriggerBlueprintNode };
