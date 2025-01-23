import { NodeEntryId, segmentEntryId } from "data/data-entry";
import { TriggerData } from "data/data-trigger";
import { ActorAura } from "helpers/helpers-aura";
import { MODULE, R } from "module-helpers";
import { NodeEventKey } from "schema/schema-list";
import { TriggerNode, TriggerNodeEntryValue } from "./node/trigger-node";
import { createTriggerNode } from "./node/trigger-node-list";

class Trigger {
    #data: TriggerData;
    #nodes: Record<string, TriggerNode>;
    #event: TriggerNode;
    #options!: TriggerExecuteOptions;

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

    get options(): TriggerExecuteOptions {
        return this.#options;
    }

    async execute(options: TriggerExecuteOptions): Promise<void> {
        options.variables = {
            [this.#event.id]: {
                ["this"]: options.this,
            },
        };

        this.#options = options;

        try {
            MODULE.debug("execute trigger", this);
            await this.#event["_execute"](options.this);
        } catch (error) {
            MODULE.error(
                `an error occured while processing the trigger: ${this.#data.name}`,
                error
            );
        }
    }

    setOption<K extends keyof TriggerExecuteOptions>(key: K, value: TriggerExecuteOptions[K]) {
        this.#options[key] = value;
    }

    getVariable(nodeId: string, key: string): TriggerNodeEntryValue {
        return fu.getProperty(this.#options, `variables.${nodeId}.${key}`);
    }

    setVariable(nodeId: string, key: string, value: TriggerNodeEntryValue) {
        fu.setProperty(this.#options, `variables.${nodeId}.${key}`, value);
    }

    getNodeFromEntryId(id: NodeEntryId): TriggerNode {
        const { nodeId } = segmentEntryId(id);
        return this.#nodes[nodeId];
    }

    getNode(id: string): TriggerNode {
        return this.#nodes[id];
    }
}

type TriggerVariables = Record<string, Record<string, TriggerNodeEntryValue>>;

type TriggerExecuteOptions = {
    this: TargetDocuments;
    aura?: ActorAura;
    variables: TriggerVariables;
};

export { Trigger };
export type { TriggerExecuteOptions };
