import { EntryField } from "blueprint";
import { Blueprint } from "blueprint/blueprint";
import {
    addListenerAll,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationPosition,
    ApplicationRenderOptions,
    assignStyle,
    DatasetData,
    dataToDatasetString,
    localize,
    R,
    render,
} from "module-helpers";
import { FilterGroup, FilterNodeData } from "schema";

class BlueprintMenu<TData extends DOMStringMap> extends foundry.applications.api.ApplicationV2<
    BlueprintMenuConfiguration<TData>
> {
    #blueprint: Blueprint;
    #groups: BlueprintMenuGroup[];
    #resolve: BlueprintMenuResolve<TData>;
    #target: BlueprintMenuPoint | EntryField;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        window: {
            resizable: false,
            minimizable: false,
            frame: false,
            positioned: true,
        },
        id: "pf2e-trigger-context-menu",
    };

    constructor({ blueprint, groups, resolve, target, ...options }: BlueprintMenuOptions<TData>) {
        super(options);

        this.#blueprint = blueprint;
        this.#groups = groups;
        this.#resolve = resolve;
        this.#target = target;
    }

    static wait<TData extends DOMStringMap>(
        configs: Omit<BlueprintMenuOptions<TData>, "resolve">
    ): Promise<null | TData> {
        return new Promise((resolve: BlueprintMenuResolve<TData>) => {
            new BlueprintMenu({ ...configs, resolve }).render(true);
        });
    }

    static waitNodes(
        blueprint: Blueprint,
        groups: FilterGroup[],
        x: number,
        y: number
    ): Promise<null | FilterNodeData> {
        return BlueprintMenu.wait({
            blueprint,
            groups,
            target: { x, y },
            classes: ["nodes-menu"],
        });
    }

    static async waitContext<TData extends string>(
        blueprint: Blueprint,
        entries: TData[],
        x: number,
        y: number
    ): Promise<null | { value: TData }> {
        if (!entries.length) {
            return null;
        }

        const groups = [
            {
                title: "",
                entries: entries.map((value) => {
                    return {
                        data: { value },
                        label: localize("context", value),
                    };
                }),
            },
        ];

        return BlueprintMenu.wait({
            blueprint,
            groups,
            target: { x, y, align: "top" },
            classes: ["node-context"],
        });
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get target(): BlueprintMenuPoint | EntryField {
        return this.#target;
    }

    async close(options?: ApplicationClosingOptions) {
        return super.close({ animate: false });
    }

    _onClose(options: ApplicationClosingOptions): void {
        this.#resolve(null);
    }

    _onFirstRender(context: object, options: ApplicationRenderOptions) {
        requestAnimationFrame(() => {
            this.element.addEventListener("blur", (event) => {
                this.close();
            });

            this.element.focus();
        });
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<ContextMenuContext> {
        return {
            groups: this.#groups.map(({ entries, title, isSub }) => {
                return {
                    entries: entries.map(({ data, label }) => {
                        return {
                            dataset: R.isString(data) ? data : dataToDatasetString(data),
                            label,
                        };
                    }),
                    title,
                    isSub,
                };
            }),
        };
    }

    _renderHTML(context: object, options: ApplicationRenderOptions): Promise<string> {
        return render("context-menu", context);
    }

    _replaceHTML(result: string, content: HTMLElement, options: ApplicationRenderOptions): void {
        content.innerHTML = result;
        content.tabIndex = 0;

        this.#activateListeners(content);
    }

    _updatePosition(position: ApplicationPosition) {
        const el = this.element;
        const target = this.target;
        const bounds = el.getBoundingClientRect();
        const viewBounds = this.blueprint.getBoundClientRect();

        if (target instanceof EntryField) {
            const { left, top, bottom, width } = target.globalBounds;

            position.top = bottom;
            position.left = left;

            if (bottom + bounds.height > viewBounds.height && top > viewBounds.height / 2) {
                position.top = top - bounds.height;
            }

            el.style.minWidth = `${width}px`;
        } else {
            const { x, y } = this.blueprint.getGlobalCoordinates(target);

            position.left = x - bounds.width / 2;

            if (target.align === "top") {
                position.top = y - bounds.height - 2;

                if (position.top < viewBounds.top && y < viewBounds.height / 2) {
                    position.top = y + 2;
                }
            } else if (target.align === "bottom") {
                position.top = y + 2;

                if (position.top + bounds.height > viewBounds.height && y > viewBounds.height / 2) {
                    position.top = y - bounds.height - 2;
                }
            } else {
                position.top = y - bounds.height / 2;

                if (position.top + bounds.height > viewBounds.bottom) {
                    position.top = viewBounds.bottom - bounds.height;
                }

                if (position.top < viewBounds.top) {
                    position.top = viewBounds.top;
                }
            }
        }

        assignStyle(el, {
            left: `${position.left}px`,
            top: `${position.top}px`,
            maxHeight: `${viewBounds.height}px`,
        });

        return position;
    }

    #activateListeners(html: HTMLElement) {
        addListenerAll(html, "li", (event, el) => {
            event.stopPropagation();
            this.#resolve(el.dataset as TData);
            this.close();
        });
    }
}

type ContextMenuContext = {
    groups: (Omit<BlueprintMenuGroup, "entries"> & {
        entries: { label: string; dataset: string }[];
    })[];
};

type BlueprintMenuPoint = Point & {
    align?: "top" | "center" | "bottom";
};

type BaseContextMenuConfigs<TData extends DOMStringMap> = {
    blueprint: Blueprint;
    groups: BlueprintMenuGroup[];
    target: BlueprintMenuPoint | EntryField;
    resolve: BlueprintMenuResolve<TData>;
};

type BlueprintMenuConfiguration<TData extends DOMStringMap> = ApplicationConfiguration &
    BaseContextMenuConfigs<TData>;

type BlueprintMenuOptions<TData extends DOMStringMap> = DeepPartial<ApplicationConfiguration> &
    BaseContextMenuConfigs<TData>;

type BlueprintMenuResolve<T extends DOMStringMap> = (value: T | null) => void;

type BlueprintMenuGroupEntry = {
    data: DatasetData | string;
    label: string;
};

type BlueprintMenuGroup<T extends BlueprintMenuGroupEntry = BlueprintMenuGroupEntry> = {
    entries: T[];
    isSub?: boolean;
    title: string;
};

export { BlueprintMenu };
export type { BlueprintMenuGroup, BlueprintMenuGroupEntry, BlueprintMenuOptions };
