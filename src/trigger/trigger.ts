import { NodeEntryId, segmentEntryId } from "data/data-entry";
import { TriggerData } from "data/data-trigger";
import { ActorAura } from "helpers/helpers-aura";
import { MODULE, R } from "module-helpers";
import { NodeEventKey } from "schema/schema-list";
import { TriggerNode, TriggerNodeEntryValue } from "./node/trigger-node";
import { createTriggerNode } from "./node/trigger-node-list";
import { InsideAuraTriggerNode } from "./node/condition/trigger-inside-aura";

class Trigger {
    #data: TriggerData;
    #nodes: Record<string, TriggerNode>;
    #event: TriggerNode;
    #insideAura: InsideAuraTriggerNode | undefined;
    #options!: TriggerExecuteOptions;

    constructor(data: TriggerData) {
        this.#data = data;
        this.#nodes = R.pipe(
            data.nodes,
            R.mapValues((data) => createTriggerNode(this, data))
        );
        this.#event = this.#nodes[data.event.id];
        this.#insideAura = R.values(this.#nodes).find((x) => x instanceof InsideAuraTriggerNode) as
            | InsideAuraTriggerNode
            | undefined;
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

    get insideAura(): InsideAuraTriggerNode | undefined {
        return this.#insideAura;
    }

    async execute(options: TriggersExecuteCallOptions): Promise<void> {
        (options as TriggerExecuteOptions).variables = {
            [this.#event.id]: {
                ["this"]: options.this,
            },
        };

        this.#options = options as TriggerExecuteOptions;

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

    getNode(id: NodeEntryId): TriggerNode {
        const { nodeId } = segmentEntryId(id);
        return this.#nodes[nodeId];
    }
}

type TriggerVariables = Record<string, Record<string, TriggerNodeEntryValue>>;

type TriggerExecuteOptions = {
    this: TargetDocuments;
    aura?: ActorAura;
    variables: TriggerVariables;
};

type TriggersExecuteCallOptions = Omit<TriggerExecuteOptions, "variables">;

export { Trigger };
export type { TriggersExecuteCallOptions, TriggerExecuteOptions };
