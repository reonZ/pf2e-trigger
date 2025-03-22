import { Blueprint } from "blueprint/blueprint";
import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { haveCompatibleEntryType } from "data/data-entry";
import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    TemplateLocalize,
    addListenerAll,
    localize,
    templateLocalize,
} from "module-helpers";
import { getFilters, getSchema, getSubtriggerSchema } from "schema/schema-list";
import { BlueprintMenu } from "./blueprint-menu";

class BlueprintNodesMenu extends BlueprintMenu<NodesMenuReturnValue> {
    #source: BlueprintEntry | undefined;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["nodes-menu"],
    };

    protected constructor(
        blueprint: Blueprint,
        target: Point | PIXI.Container,
        resolve: BlueprintMenuResolve<NodesMenuReturnValue>,
        source?: BlueprintEntry,
        options?: DeepPartial<BlueprintMenuOptions>
    ) {
        super(blueprint, target, resolve, options);

        this.#source = source;
    }

    static open(
        blueprint: Blueprint,
        target: Point | PIXI.Container,
        source?: BlueprintEntry,
        options?: DeepPartial<BlueprintMenuOptions>
    ): Promise<NodesMenuReturnValue | null> {
        return new Promise((resolve) => {
            const menu = new this(blueprint, target, resolve, source, options);
            menu.render(true);
        });
    }

    get template(): string {
        return "nodes-menu";
    }

    get source(): BlueprintEntry | undefined {
        return this.#source;
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<MenuData> {
        const groups = R.pipe(
            this.#getFilters(),
            R.map(({ key, type }): DataNode => {
                return {
                    key,
                    type,
                    label: localize("node", type, key, "title"),
                };
            }),
            R.groupBy(R.prop("type")),
            R.mapValues((nodes, type): DataNodesGroup => {
                return {
                    title: localize(`node.${type}.title`),
                    nodes: R.sortBy(nodes, R.prop("label")),
                };
            })
        );

        const variables = this.#getVariables();
        if (variables.length) {
            groups.variable = {
                title: localize("node.variable.title"),
                nodes: variables,
            };
        }

        const subtriggers = this.#getSubtriggers();
        if (subtriggers.length) {
            groups.subtrigger = {
                title: localize("node.subtrigger.title"),
                nodes: subtriggers,
            };
        }

        return {
            groups,
            i18n: templateLocalize("node"),
        };
    }

    #getVariables(): DataNode[] {
        const trigger = this.trigger;
        const sourceEntry = this.source;

        if (!trigger || sourceEntry?.category === "outputs") {
            return [];
        }

        const uniqueVariables: DataNode[] = R.pipe(
            R.values(trigger.nodes),
            R.flatMap((node): DataNode[] => {
                const schema = getSchema(node);
                if (!schema.unique) return [];

                return R.pipe(
                    schema.variables,
                    R.map(({ key, type }): DataNode | undefined => {
                        if (sourceEntry && !haveCompatibleEntryType(sourceEntry, { type })) return;

                        const entryId: NodeEntryId = `${node.id}.outputs.${key}`;
                        const entry = this.blueprint.getEntry(entryId);
                        if (!entry) return;

                        const entryLabel = entry?.label;

                        return {
                            type: "variable",
                            label: entryLabel,
                            key: `${node.id}.outputs.${key}.${type}.${entryLabel}` satisfies BlueprintMenuVariableKey,
                        };
                    }),
                    R.filter(R.isTruthy)
                );
            })
        );

        const triggerVariables: DataNode[] = R.pipe(
            R.entries(trigger.variables),
            R.map(([entryId, label]): DataNode | undefined => {
                const entry = this.blueprint.getEntry(entryId);
                if (!entry || !entry.type) return;

                const entryLabel = label.trim() || entry.label;

                return {
                    type: "variable",
                    label: entryLabel,
                    key: `${entry.node.id}.outputs.${entry.key}.${entry.type}.${entryLabel}` satisfies BlueprintMenuVariableKey,
                };
            }),
            R.filter(R.isTruthy)
        );

        return [...uniqueVariables, ...triggerVariables];
    }

    #getSubtriggers(): DataNode[] {
        if (this.trigger?.event.type === "subtrigger") {
            return [];
        }

        const entry = this.source;
        const targetCategory = entry?.oppositeCategory;

        return R.pipe(
            this.blueprint.subtriggers,
            R.map((data): DataNode | undefined => {
                if (entry) {
                    const schema = getSubtriggerSchema(data);
                    const hasTarget = schema[targetCategory!].some((targetEntry) =>
                        haveCompatibleEntryType(entry, targetEntry as any)
                    );
                    if (!hasTarget) return;
                }

                return {
                    type: "subtrigger",
                    key: data.id,
                    label: data.name,
                };
            }),
            R.filter(R.isTruthy)
        );
    }

    #getFilters(): NodeSchemaFilter[] {
        const filters = getFilters(this.trigger);
        const entry = this.source;

        if (!entry) {
            return filters;
        }

        const isBridge = entry.isBridgeEntry();
        const targetCategory = entry.oppositeCategory;

        return R.pipe(
            filters,
            R.filter((filter) => {
                const entries = filter[targetCategory];

                return (
                    entries.some((type) => haveCompatibleEntryType(entry, { type })) &&
                    (!isBridge || entry.canConnectoToBridge(filter.type))
                );
            })
        );
    }

    protected _activateListeners(html: HTMLElement) {
        addListenerAll(html, "li", (event, el) => {
            event.stopPropagation();

            const { type, key } = el.dataset as MenuNode;

            this.resolve({ type, key });
            this.close();
        });
    }
}

type DataNode = { type: NodeType; key: string; label: string };
type DataNodesGroup = { title: string; nodes: DataNode[] };

type MenuData = {
    groups: Partial<Record<NodeType, DataNodesGroup>>;
    i18n: TemplateLocalize;
};

type MenuNode = {
    type: NodeType;
    key: string;
};

type NodesMenuReturnValue = { type: NodeType; key: string };

export { BlueprintNodesMenu };
