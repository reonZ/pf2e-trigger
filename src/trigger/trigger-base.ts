import { MODULE, R } from "module-helpers";
import { TriggerNode } from "./node/trigger-node";
import { Subtrigger } from "./trigger-subtrigger";
import { segmentEntryId } from "data/data-entry";
import { getSchema, getSubtriggerSchema } from "schema/schema-list";
import { SubtriggerNode } from "./node/trigger-node-subtrigger";
import { createTriggerNode } from "./node/trigger-node-list";

abstract class BaseTrigger {
    #data: TriggerData;
    #nodes: Record<string, TriggerNode>;
    #event: TriggerNode;
    #options!: TriggerExecuteOptions;

    constructor(data: TriggerData, subtriggers?: Record<string, Subtrigger>) {
        this.#data = data;

        this.#nodes = R.pipe(
            R.values(data.nodes),
            R.map((nodeData) => {
                if (subtriggers && nodeData.subId) {
                    const subtrigger = subtriggers[nodeData.subId];
                    const schema = getSubtriggerSchema(subtrigger.data);

                    return schema
                        ? new SubtriggerNode(this, nodeData, schema, subtrigger)
                        : undefined;
                }

                const schema = getSchema(nodeData);
                return schema ? createTriggerNode(this, nodeData, schema) : undefined;
            }),
            R.filter(R.isTruthy),
            R.mapToObj((node) => [node.id, node])
        );

        this.#event = this.#nodes[data.event.id];
    }

    get id(): string {
        return this.#data.id;
    }

    get data(): TriggerData {
        return this.#data;
    }

    get nodes(): TriggerNode[] {
        return R.values(this.#nodes);
    }

    get eventKey(): NodeEventKey {
        return this.#data.event.key as NodeEventKey;
    }

    get event(): TriggerNode {
        return this.#event;
    }

    get options(): TriggerExecuteOptions {
        return this.#options;
    }

    getNodeFromEntryId(id: NodeEntryId): TriggerNode | undefined {
        const { nodeId } = segmentEntryId(id);
        return this.#nodes[nodeId];
    }

    async execute(options: PreTriggerExecuteOptions) {
        const eventId = this.event.id;

        this.#options = {
            ...options,
            variables: {
                ...R.mapKeys(options.variables ?? {}, (key) => `${eventId}.outputs.${key}`),
                [`${eventId}.outputs.this`]: options.this,
            },
        };

        try {
            MODULE.debug("execute trigger", this);
            await this.event.execute();
        } catch (error) {
            MODULE.error(`an error occured while processing the trigger: ${this.data.name}`, error);
        }

        // @ts-expect-error
        this.#options = {};
    }
}

export { BaseTrigger };
