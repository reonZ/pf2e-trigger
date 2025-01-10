import { NodeEntryType, NodeType } from "@node/trigger-node";
import { getNodesFilters } from "@node/trigger-nodes-list";
import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationPosition,
    ApplicationRenderOptions,
    R,
    addListenerAll,
    htmlQuery,
    localize,
    render,
    templateLocalize,
} from "module-helpers";
import { Blueprint } from "./blueprint";
import { BlueprintNodeEntry, canConnectoToBridge } from "./node/node-entry";
import { Trigger } from "@trigger/trigger";

class BlueprintMenu extends foundry.applications.api.ApplicationV2 {
    #resolve: BlueprintMenuResolve;
    #point: Point;
    #blueprint: Blueprint;
    #source: BlueprintNodeEntry | undefined;

    private constructor(
        blueprint: Blueprint,
        point: Point,
        resolve: BlueprintMenuResolve,
        source?: BlueprintNodeEntry,
        options?: DeepPartial<ApplicationConfiguration>
    ) {
        super(options);

        this.#blueprint = blueprint;
        this.#point = blueprint.getGlobalCoordinates(point);
        this.#resolve = resolve;
        this.#source = source;
    }

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        window: {
            resizable: false,
            minimizable: false,
            frame: false,
            positioned: true,
        },
        id: "pf2e-trigger-blueprint-menu",
    };

    static open(
        blueprint: Blueprint,
        point: Point,
        source?: BlueprintNodeEntry,
        options?: DeepPartial<ApplicationConfiguration>
    ): Promise<BlueprintMenuReturnedValue> {
        return new Promise<BlueprintMenuReturnedValue>((resolve) => {
            const menu = new this(blueprint, point, resolve, source, options);
            menu.render(true);
        });
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get view() {
        return this.blueprint.view;
    }

    get trigger(): Trigger | null {
        return this.blueprint.trigger;
    }

    async close(options?: ApplicationClosingOptions) {
        return super.close({ animate: false });
    }

    _onClose() {
        this.#resolve(null);
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<BlueprintMenuContext> {
        const groups = R.pipe(
            this.#getFilterNodes(),
            R.map(
                ({ key, type }): ContextNode => ({
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

    #getFilterNodes(): BlueprintMenuFilterNode[] {
        const sourceUniques = R.pipe(
            this.trigger?.getNodes() ?? [],
            R.filter((node) => node.isUnique),
            R.map((node) => ({ key: node.key, type: node.type }))
        );

        const nonUnique = R.pipe(
            getNodesFilters(),
            R.filter((filter) => !sourceUniques.some((unique) => R.hasSubObject(filter, unique)))
        );

        const source = this.#source;
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

    protected _renderHTML(context: object, options: ApplicationRenderOptions): Promise<string> {
        return render("blueprint-menu", context);
    }

    protected _replaceHTML(
        result: string,
        content: HTMLElement,
        options: ApplicationRenderOptions
    ): void {
        content.innerHTML = result;
        this.#activateListeners(content);
    }

    protected _updatePosition(position: ApplicationPosition) {
        const menu = htmlQuery(this.element, ".menu");
        if (!menu) return position;

        const bounds = menu?.getBoundingClientRect();
        const viewBounds = this.view.getBoundingClientRect();

        const point = {
            x: Math.clamp(
                this.#point.x - bounds.width / 2,
                viewBounds.left,
                viewBounds.right - bounds.width
            ),
            y: Math.clamp(
                this.#point.y - bounds.height / 2,
                viewBounds.top,
                viewBounds.bottom - bounds.height
            ),
        };

        Object.assign(menu.style, {
            left: `${point.x}px`,
            top: `${point.y}px`,
        });

        return position;
    }

    #activateListeners(html: HTMLElement) {
        html.addEventListener("click", () => this.close());

        addListenerAll(html, "li", (event, el) => {
            event.stopPropagation();

            const { type, key } = el.dataset as BlueprintMenuNode;

            this.#resolve({ type, key });
            this.close();
        });
    }
}

type ContextNode = { type: NodeType; key: string; label: string };
type ContextNodesGroup = { title: string; nodes: ContextNode[] };

type BlueprintMenuContext = {
    groups: Partial<Record<NodeType, ContextNodesGroup>>;
    i18n: ReturnType<typeof templateLocalize>;
};

type BlueprintMenuNode = {
    type: NodeType;
    key: string;
};

type BlueprintMenuReturnedValue = { type: NodeType; key: string } | null;

type BlueprintMenuResolve = (
    value: BlueprintMenuReturnedValue | PromiseLike<BlueprintMenuReturnedValue>
) => void;

type BlueprintMenuFilterNode = BlueprintMenuNode & {
    inputs: (NodeEntryType | undefined)[];
    outputs: (NodeEntryType | undefined)[];
};

export { BlueprintMenu };
