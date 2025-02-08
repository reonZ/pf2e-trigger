import { MODULE, R } from "module-helpers";
import { TriggerNode } from "./node/trigger-node";
import { segmentEntryId } from "data/data-entry";
import { getSchema, getSubtriggerSchema } from "schema/schema-list";
import { SubtriggerNode } from "./node/trigger-node-subtrigger";
import { createTriggerNode } from "./node/trigger-node-list";
import { getSubtrigger } from "./trigger-list";
import { InsideAuraTriggerCondition } from "./node/condition/trigger-condition-inside-aura";

class Trigger {
    #data: TriggerData;
    #nodes: Record<string, TriggerNode | null> = {};
    #options!: TriggerExecuteOptions;

    constructor(data: TriggerData) {
        this.#data = data;
    }

    get name(): string {
        return this.#data.name;
    }

    get id(): string {
        return this.#data.id;
    }

    get eventKey(): NodeEventKey {
        return this.#data.event.key as NodeEventKey;
    }

    get event(): TriggerNode {
        return this.getNode(this.#data.event.id)!;
    }

    get options(): TriggerExecuteOptions {
        return this.#options;
    }

    get insideAura(): Maybe<InsideAuraTriggerCondition> {
        const auraId = this.#data.aura?.id;
        return (auraId ? this.getNode(auraId) : undefined) as Maybe<InsideAuraTriggerCondition>;
    }

    getNode(id: string): TriggerNode | null {
        if (this.#nodes[id] !== undefined) {
            return this.#nodes[id];
        }

        this.#nodes[id] = (() => {
            const nodeData = this.#data.nodes[id];
            if (!nodeData) return null;

            if (nodeData.subId) {
                const subData = getSubtrigger(nodeData.subId);
                if (!subData) return null;

                const subtrigger = new Trigger(subData);
                const schema = getSubtriggerSchema(subData);

                return new SubtriggerNode(this, nodeData, schema, subtrigger);
            }

            const schema = getSchema(nodeData);
            return createTriggerNode(this, nodeData, schema);
        })();

        return this.#nodes[id];
    }

    getNodeFromEntryId(id: NodeEntryId): TriggerNode | null {
        const { nodeId } = segmentEntryId(id);
        return this.getNode(nodeId);
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
            MODULE.error(
                `an error occured while processing the trigger: ${this.#data.name}`,
                error
            );
        }
    }
}

export { Trigger };
