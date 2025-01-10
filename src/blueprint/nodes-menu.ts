import { NodeEntryType, NodeType } from "@node/trigger-node";
import { getNodesFilters } from "@node/trigger-nodes-list";
import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    addListenerAll,
    localize,
    templateLocalize,
} from "module-helpers";
import { BlueprintMenu } from "./blueprint-menu";
import { BlueprintNodeEntry, canConnectoToBridge } from "./node/node-entry";

class BlueprintNodesMenu extends BlueprintMenu<ReturnedValue, BlueprintNodeEntry> {
    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["nodes-menu"],
    };

    get template(): string {
        return "nodes-menu";
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<MenuData> {
        const groups = R.pipe(
            this.#getFilterNodes(),
            R.map(
                ({ key, type }): DataNode => ({
                    key,
                    type,
                    label: localize(`node.${type}.${key}.title`),
                })
            ),
            R.groupBy(R.prop("type")),
            R.mapValues((nodes, type) => ({ title: localize(`node.${type}.title`), nodes }))
        );

        return {
            groups,
            i18n: templateLocalize("node"),
        };
    }

    #getFilterNodes(): MenuFilterNode[] {
        const sourceUniques = R.pipe(
            this.trigger?.getNodes() ?? [],
            R.filter((node) => node.isUnique),
            R.map((node) => ({ key: node.key, type: node.type }))
        );

        const nonUnique = R.pipe(
            getNodesFilters(),
            R.filter((filter) => !sourceUniques.some((unique) => R.hasSubObject(filter, unique)))
        );

        const source = this.source;
        if (!source) return nonUnique;

        const isValue = source.isValue;
        const sourceType = source.type;
        const sourceCategory = source.category;
        const sourceNodeType = source.node.type;
        const targetCategory = source.oppositeCategory;

        return R.pipe(
            nonUnique,
            R.filter((filter) => {
                return (
                    filter[targetCategory].includes(sourceType) &&
                    (isValue || canConnectoToBridge(sourceCategory, sourceNodeType, filter.type))
                );
            })
        );
    }

    _activateListeners(html: HTMLElement) {
        super._activateListeners(html);

        addListenerAll(html, "li", (event, el) => {
            event.stopPropagation();

            const { type, key } = el.dataset as MenuNode;

            this.resolve({ type, key });
            this.close();
        });
    }
}

interface BlueprintNodesMenu extends BlueprintMenu<ReturnedValue, BlueprintNodeEntry> {}

type DataNode = { type: NodeType; key: string; label: string };
type DataNodesGroup = { title: string; nodes: DataNode[] };

type MenuData = {
    groups: Partial<Record<NodeType, DataNodesGroup>>;
    i18n: ReturnType<typeof templateLocalize>;
};

type MenuNode = {
    type: NodeType;
    key: string;
};

type ReturnedValue = { type: NodeType; key: string };

// type MenuResolve = (value: ReturnedValue | PromiseLike<ReturnedValue>) => void;

type MenuFilterNode = MenuNode & {
    inputs: (NodeEntryType | undefined)[];
    outputs: (NodeEntryType | undefined)[];
};

export { BlueprintNodesMenu };
