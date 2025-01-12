import { BlueprintNodeEntry } from "@blueprint/node/blueprint-node-entry";
import { NodeType } from "@schema/schema";
import { TriggerNodeFilter, getFilters } from "@schema/schema-list";
import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    TemplateLocalize,
    addListenerAll,
    localize,
    templateLocalize,
} from "module-helpers";
import { BlueprintMenu } from "./blueprint-menu";

class BlueprintNodesMenu extends BlueprintMenu<NodesMenuReturnValue, BlueprintNodeEntry> {
    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["nodes-menu"],
    };

    get template(): string {
        return "nodes-menu";
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

    #getFilters(): TriggerNodeFilter[] {
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
