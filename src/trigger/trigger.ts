import { NodeEntryId, NodeEntryType, TriggerData, WorldTriggers } from "data";
import { prepareHooks } from "hook";
import { getSetting, ItemPF2e, R } from "module-helpers";
import { createTriggerNode, TriggerNode } from "trigger";

class Trigger {
    #data: TriggerData;
    #options: TriggerOptions;
    #event: TriggerNode;
    #nodes: Record<string, TriggerNode | undefined> = {};

    constructor(data: TriggerData, options: TriggerPreOptions) {
        this.#data = data;
        this.#event = createTriggerNode(this, data.event);

        this.#options = {
            ...options,
            variables: {
                [`${this.#event.id}.outputs.this`]: options.this,
            },
        };
    }

    get name(): string {
        return this.#data.name;
    }

    get target(): TargetDocuments {
        return this.#options.this;
    }

    getVariable(entryId: NodeEntryId): TriggerValue | undefined {
        return this.#options.variables[entryId];
    }

    setVariable(entryId: NodeEntryId, value: TriggerValue) {
        this.#options.variables[entryId] = value;
    }

    getNode(id: string): TriggerNode | undefined {
        return (this.#nodes[id] ??= (() => {
            const nodeData = this.#data.nodes.get(id);
            return nodeData ? createTriggerNode(this, nodeData) : undefined;
        })());
    }

    getNodeFromEntryId(entryId: NodeEntryId): TriggerNode | undefined {
        const nodeId = entryId.split(".")[0];
        return this.getNode(nodeId);
    }

    async execute() {
        await this.#event.execute();
    }
}

function prepareTriggers() {
    const [subtriggers, triggers] = R.pipe(
        getSetting<WorldTriggers>("world-triggers").triggers.contents,
        R.filter((trigger) => trigger.enabled),
        R.partition((trigger) => trigger.isSubtrigger)
    );

    prepareHooks(triggers, subtriggers);
}

type TriggerPreOptions = {
    this: TargetDocuments;
    [k: string]: any;
};

type TriggerOptions = TriggerPreOptions & {
    variables: Record<NodeEntryId, TriggerValue>;
};

type TriggerValue<T extends NodeEntryType = NodeEntryType> = T extends "number"
    ? number
    : T extends "target"
    ? TargetDocuments | undefined
    : T extends "item"
    ? ItemPF2e | undefined
    : T extends "text"
    ? string
    : unknown;

export { prepareTriggers, Trigger };
export type { TriggerOptions, TriggerPreOptions, TriggerValue };
