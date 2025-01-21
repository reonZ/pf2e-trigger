import { TriggerData } from "data/data-trigger";
import { TriggerNode } from "./node/trigger-node";
import { createTriggerNode } from "./node/trigger-node-list";
import { NodeEntryId, segmentEntryId } from "data/data-entry";
import { AuraData, MODULE } from "module-helpers";

class Trigger {
    #data: TriggerData;
    #nodes: Record<string, TriggerNode> = {};

    constructor(data: TriggerData) {
        this.#data = data;
    }

    async execute(options: TriggerExecuteOptions): Promise<void> {
        try {
            const event = createTriggerNode(this, this.#data.event);
            await event["_execute"](options.target, options);
        } catch (error) {
            MODULE.error(
                `an error occured while processing the trigger: ${this.#data.name}`,
                error
            );
        } finally {
            MODULE.debug("execute trigger", this);
        }
    }

    getNode(id: NodeEntryId): TriggerNode {
        const { nodeId } = segmentEntryId(id);
        return (this.#nodes[nodeId] ??= createTriggerNode(this, this.#data.nodes[nodeId]));
    }
}

type TriggerExecuteOptions = { target: TargetDocuments; source?: TargetDocuments; aura?: AuraData };

export { Trigger };
export type { TriggerExecuteOptions };
