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
import { getFilters, getSubtriggerSchema } from "schema/schema-list";
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
        const sourceEntry = this.source;
        const sourceIsInput = sourceEntry?.category === "inputs";
        const setterLabel = localize("node.variable.setter");

        return this.blueprint
            .getVariables()
            .flatMap(({ entryId, label, entryType, custom, global }) => {
                const key = `${entryId}.${entryType}.${label}` satisfies BlueprintVariableKey;
                const entries: DataNode[] = [];

                if (
                    !sourceEntry ||
                    (sourceIsInput && haveCompatibleEntryType(sourceEntry, { type: entryType }))
                ) {
                    entries.push({
                        type: "variable",
                        label,
                        key,
                    });
                }

                if (
                    custom &&
                    global &&
                    (!sourceEntry ||
                        sourceEntry.isBridgeEntry() ||
                        (!sourceIsInput &&
                            haveCompatibleEntryType(sourceEntry, { type: entryType })))
                ) {
                    entries.push({
                        type: "setter",
                        label: `${label} (${setterLabel})`,
                        key,
                    });
                }

                return entries;
            });
    }

    #getSubtriggers(): DataNode[] {
        if (this.trigger?.event.type === "subtrigger") {
            return [];
        }

        const sourceEntry = this.source;
        const targetCategory = sourceEntry?.oppositeCategory;

        return R.pipe(
            this.blueprint.subtriggers,
            R.map((data): DataNode | undefined => {
                if (sourceEntry) {
                    const schema = getSubtriggerSchema(data);
                    const hasTarget = schema[targetCategory!].some((targetEntry) =>
                        haveCompatibleEntryType(sourceEntry, targetEntry as any)
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
        const sourceEntry = this.source;

        if (!sourceEntry) {
            return filters;
        }

        const isBridge = sourceEntry.isBridgeEntry();
        const targetCategory = sourceEntry.oppositeCategory;

        return R.pipe(
            filters,
            R.filter((filter) => {
                const entries = filter[targetCategory];

                return (
                    entries.some((type) => haveCompatibleEntryType(sourceEntry, { type })) &&
                    (!isBridge || sourceEntry.canConnectoToBridge(filter.type))
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
