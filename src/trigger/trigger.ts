import { NodeEntryId, segmentEntryId } from "data/data-entry";
import { TriggerData } from "data/data-trigger";
import { AuraData, MODULE, R } from "module-helpers";
import { TriggerNode } from "./node/trigger-node";
import { createTriggerNode } from "./node/trigger-node-list";
import { NodeEventKey } from "schema/schema-list";

class Trigger {
    #data: TriggerData;
    #nodes: Record<string, TriggerNode>;
    #event: TriggerNode;

    constructor(data: TriggerData) {
        this.#data = data;
        this.#nodes = R.pipe(
            data.nodes,
            R.mapValues((data) => createTriggerNode(this, data))
        );
        this.#event = this.#nodes[data.event.id];
    }

    get id(): string {
        return this.#data.id;
    }

    get eventKey(): NodeEventKey {
        return this.#data.event.key as NodeEventKey;
    }

    get nodes() {
        return R.values(this.#nodes);
    }

    async execute(options: TriggerExecuteOptions): Promise<void> {
        try {
            MODULE.debug("execute trigger", this);
            await this.#event["_execute"](options.target, options);
        } catch (error) {
            MODULE.error(
                `an error occured while processing the trigger: ${this.#data.name}`,
                error
            );
        }
    }

    getNode(id: NodeEntryId): TriggerNode {
        const { nodeId } = segmentEntryId(id);
        return this.#nodes[nodeId];
    }
}

type TriggerExecuteOptions = { target: TargetDocuments; source?: TargetDocuments; aura?: AuraData };

export { Trigger };
export type { TriggerExecuteOptions };
