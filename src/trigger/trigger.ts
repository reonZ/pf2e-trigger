import {
    NodeEntryId,
    NodeEntryType,
    nodeIdFromEntry,
    TriggerData,
    TriggerDataSource,
    TriggersContext,
} from "data";
import { prepareHooks } from "hook";
import {
    ActorPF2e,
    CheckDC,
    DurationData,
    getSetting,
    ItemPF2e,
    R,
    RollNoteSource,
} from "module-helpers";
import { createTriggerNode, TriggerNode } from "trigger";

let MODULES_CONTEXTS: TriggersContext[] = [];

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

    get module(): string | undefined {
        return this.#data.module;
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

async function prepareModuleTriggers() {
    const modulesDataPromises = game.modules.map(async (module) => {
        if (!module.active) return;

        const key = module.id;
        const filePath = module.flags?.[key]?.["triggers"];
        if (!R.isString(filePath)) return;

        try {
            const path = filePath.startsWith("/") ? filePath.slice(1) : filePath;
            const response = await fetch(`modules/${key}/${path}`);
            const json = await response.json();

            return R.isArray(json.triggers)
                ? ([key, json.triggers as TriggerDataSource[]] as const)
                : undefined;
        } catch {}
    });

    MODULES_CONTEXTS = R.pipe(
        await Promise.all(modulesDataPromises),
        R.filter(R.isTruthy),
        R.map(([key, sources]) => {
            const triggers = R.pipe(
                sources,
                R.map((data) => {
                    if (!R.isPlainObject(data)) return;

                    try {
                        const trigger = new TriggerData(data);
                        if (trigger.invalid) return;

                        // we add the module id and keep the original ids to allow switching enabled
                        return trigger.clone({ module: key }, { keepId: true });
                    } catch {}
                }),
                R.filter(R.isTruthy)
            );

            return new TriggersContext({
                module: key,
                triggers: triggers.map((x) => x.toObject()),
            });
        }),
        R.filter(R.isTruthy)
    );
}

function prepareTriggers() {
    const worldContext = getSetting<TriggersContext>("world-triggers");
    const triggers = R.pipe(
        [
            getSetting<TriggersContext>("world-triggers").triggers.contents,
            ...MODULES_CONTEXTS.flatMap((context) => context.triggers.contents),
        ],
        R.flat(),
        R.filter((trigger) => worldContext.isEnabled(trigger))
    );

    prepareHooks(triggers);
}

function getModulesContexts(): TriggersContext[] {
    return MODULES_CONTEXTS;
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
    ? TriggerDurationEntry | undefined
    : T extends "effect"
    ? TriggerEffectEntry | undefined
    : T extends "object"
    ? Record<string, any>
    : unknown;

type TriggerRollEntry = {
    origin?: TargetDocuments;
    item?: ItemPF2e<ActorPF2e>;
    notes: RollNoteSource[];
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
    duration?: TriggerDurationEntry;
    img: ImageFilePath;
};

export { getModulesContexts, prepareModuleTriggers, prepareTriggers, Trigger };
export type {
    TriggerDcEntry,
    TriggerDurationEntry,
    TriggerEffectEntry,
    TriggerOptions,
    TriggerPreOptions,
    TriggerRollEntry,
    TriggerValue,
};
