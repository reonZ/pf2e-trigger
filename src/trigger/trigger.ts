import { NodeEntryId, NodeEntryType, TriggerData, WorldTriggers } from "data";
import { prepareHooks } from "hook";
import { ActorPF2e, CheckDC, getSetting, ItemPF2e, R } from "module-helpers";
import { createTriggerNode, TriggerNode } from "trigger";

let SUBTRIGGERS: Record<string, TriggerData> = {};

class Trigger {
    #data: TriggerData;
    #options: TriggerOptions;
    #event: TriggerNode;
    #nodes: Record<string, TriggerNode | undefined> = {};

    constructor(data: TriggerData, options: TriggerPreOptions) {
        this.#data = data;
        this.#event = createTriggerNode(this, data.event);

        options.variables ??= {};
        options.variables[`${this.#event.id}.outputs.this`] = options.this;

        this.#options = options as TriggerOptions;
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

    setOptions(key: Exclude<string, "variables" | "this">, value: any) {
        this.#options[key] = value;
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

    SUBTRIGGERS = R.mapToObj(subtriggers, (trigger) => [trigger.id, trigger]);

    prepareHooks(triggers, subtriggers);
}

function getSubtrigger(id: string): TriggerData | undefined {
    return SUBTRIGGERS[id];
}

type TriggerPreOptions = {
    this: TargetDocuments;
    variables?: Record<NodeEntryId, TriggerValue>;
    [k: string]: any;
};

type TriggerOptions = WithRequired<TriggerPreOptions, "variables">;

type TriggerValue<T extends NodeEntryType = NodeEntryType> = T extends "boolean"
    ? boolean
    : T extends "number"
    ? number
    : T extends "target"
    ? TargetDocuments | undefined
    : T extends "item"
    ? ItemPF2e | undefined
    : T extends "text" | "select"
    ? string
    : T extends "roll"
    ? TriggerRollEntry
    : T extends "dc"
    ? TriggerDcEntry
    : unknown;

type TriggerRollEntry = {
    origin?: TargetDocuments;
    item?: ItemPF2e<ActorPF2e>;
    options: string[];
    traits: string[];
};

type TriggerDcEntry = WithRequired<CheckDC, "scope"> & {
    target?: TargetDocuments;
};

export { getSubtrigger, prepareTriggers, Trigger };
export type { TriggerDcEntry, TriggerOptions, TriggerPreOptions, TriggerRollEntry, TriggerValue };
