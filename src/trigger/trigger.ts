import { NodeEntryId, NodeEntryType, nodeIdFromEntry, TriggerData, WorldTriggers } from "data";
import { prepareHooks } from "hook";
import { ActorPF2e, CheckDC, DurationData, getSetting, ItemPF2e, R } from "module-helpers";
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

    get id(): string {
        return this.#data.id;
    }

    get label(): string {
        return this.#data.label;
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

    getOption(key: string) {
        return this.#options[key];
    }

    setOption(key: Exclude<string, "variables" | "this">, value: any) {
        this.#options[key] = value;
    }

    getNode(id: string): TriggerNode | undefined {
        return (this.#nodes[id] ??= (() => {
            const nodeData = this.#data.nodes.get(id);
            return nodeData ? createTriggerNode(this, nodeData) : undefined;
        })());
    }

    getNodeFromEntryId(entryId: NodeEntryId): TriggerNode | undefined {
        return this.getNode(nodeIdFromEntry(entryId));
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

type TriggerPreOptions<TOptions extends Record<string, any> = Record<string, any>> = TOptions & {
    this: TargetDocuments;
    variables?: Record<NodeEntryId, TriggerValue>;
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
    : T extends "text" | "select" | "uuid"
    ? string
    : T extends "roll"
    ? TriggerRollEntry
    : T extends "dc"
    ? TriggerDcEntry
    : T extends "list"
    ? string[]
    : T extends "duration"
    ? TriggerDurationEntry
    : T extends "effect"
    ? TriggerEffectEntry
    : T extends "object"
    ? Record<string, any>
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

type TriggerDurationEntry = DurationData & {
    origin?: TargetDocuments;
};

type TriggerEffectEntry = {
    unidentified: boolean;
    name: string;
    duration: TriggerDurationEntry;
    img: ImageFilePath;
};

export { getSubtrigger, prepareTriggers, Trigger };
export type {
    TriggerDcEntry,
    TriggerDurationEntry,
    TriggerEffectEntry,
    TriggerOptions,
    TriggerPreOptions,
    TriggerRollEntry,
    TriggerValue,
};
