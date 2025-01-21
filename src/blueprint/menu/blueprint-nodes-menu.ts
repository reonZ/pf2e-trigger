import { NodeType } from "schema/schema";
import { NodeFilter, getFilters } from "schema/schema-list";
import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    TemplateLocalize,
    addListenerAll,
    localize,
    templateLocalize,
} from "module-helpers";
import { BlueprintMenu, BlueprintMenuOptions, BlueprintMenuResolve } from "./blueprint-menu";
import { BlueprintEntry } from "blueprint/node/entry/blueprint-entry";
import { Blueprint } from "blueprint/blueprint";

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
                    label: localize(`node.${type}.${key}.title`),
                };
            }),
            R.groupBy(R.prop("type")),
            R.mapValues((nodes, type) => ({ title: localize(`node.${type}.title`), nodes }))
        );

        return {
            groups,
            i18n: templateLocalize("node"),
        };
    }

    #getFilters(): NodeFilter[] {
        const filters = getFilters(this.trigger);
        const entry = this.source;
        if (!entry) return filters;

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
