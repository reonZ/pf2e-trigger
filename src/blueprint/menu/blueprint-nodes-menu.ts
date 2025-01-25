import { Blueprint } from "blueprint/blueprint";
import { BlueprintEntry } from "blueprint/node/entry/blueprint-entry";
import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    TemplateLocalize,
    addListenerAll,
    localize,
    templateLocalize,
} from "module-helpers";
import { NodeEntryType, NodeType } from "schema/schema";
import { NodeFilter, getFilters, getSchema } from "schema/schema-list";
import { BlueprintMenu, BlueprintMenuOptions, BlueprintMenuResolve } from "./blueprint-menu";

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

        return {
            groups,
            i18n: templateLocalize("node"),
        };
    }

    #getVariables(): DataNode[] {
        const entry = this.source;

        if (entry && (entry.category === "outputs" || !entry.isValue)) {
            return [];
        }

        const variables = R.pipe(
            R.values(this.trigger?.nodes ?? {}),
            R.flatMap((node, _, nodes) => {
                const schema = getSchema(node);
                if (!schema.variables?.length) return;

                const counter = !!schema.unique
                    ? 0
                    : nodes.filter((x) => x.key === node.key).length;

                return schema.variables.map((variable): DataNode & { entryType: NodeEntryType } => {
                    const label = localize("node.variable", variable.key);

                    return {
                        type: "variable",
                        entryType: variable.type,
                        key: `${node.id}.${variable.key}.${variable.type}`,
                        label: counter > 1 ? `${label} (${counter})` : label,
                    };
                });
            }),
            R.filter(R.isTruthy)
        );

        if (!entry) {
            return variables;
        }

        return R.pipe(
            variables,
            R.filter((variable) => {
                return entry.type === variable.entryType;
            })
        );
    }

    #getFilters(): NodeFilter[] {
        const filters = getFilters(this.trigger);
        const entry = this.source;

        if (!entry) {
            return filters;
        }

        const isValue = entry.isValue;
        const targetCategory = entry.oppositeCategory;

        return R.pipe(
            filters,
            R.filter((filter) => {
                return (
                    filter[targetCategory].includes(entry.type) &&
                    (isValue || entry.canConnectoToBridge(filter.type))
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
export type { NodesMenuReturnValue };
