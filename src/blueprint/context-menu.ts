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
    datasetToData,
    dataToDatasetString,
    localize,
    R,
    render,
} from "module-helpers";

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

    static wait<TData extends Record<string, any>>(
        configs: Omit<BlueprintMenuOptions<TData>, "resolve">
    ): Promise<null | TData> {
        return new Promise((resolve: BlueprintMenuResolve<TData>) => {
            new BlueprintMenu({ ...configs, resolve }).render(true);
        });
    }

    static async waitContext<T extends BlueprintWaitContextData<string>>(
        blueprint: Blueprint,
        entries: T[],
        x: number,
        y: number
    ): Promise<null | (T extends string ? BlueprintWaitContextData<T> : T)> {
        if (!entries.length) {
            return null;
        }

        const groups = [
            {
                title: "",
                entries: entries.map((data) => {
                    return {
                        data,
                        label: localize("context", data.value, data),
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
        const viewBoundCenter = (viewBounds.top + viewBounds.height) / 2;

        if (target instanceof EntryField) {
            const { left, top, bottom, width, center } = target.globalBounds;

            position.top = bottom;
            position.left = left;

            if (position.top + bounds.height > viewBounds.bottom && center.y > viewBoundCenter) {
                position.top = top - bounds.height;
            }

            if (position.top + bounds.height > viewBounds.bottom) {
                position.top = viewBounds.bottom - viewBounds.height;
            }

            if (position.top < viewBounds.top) {
                position.top = viewBounds.top;
            }

            el.style.minWidth = `${width}px`;
        } else {
            const { x, y } = this.blueprint.getGlobalCoordinates(target);

            position.left = x - bounds.width / 2;

            if (target.align === "top") {
                position.top = y - bounds.height - 2;

                if (position.top < viewBounds.top && y < viewBoundCenter) {
                    position.top = y + 2;
                }
            } else if (target.align === "bottom") {
                position.top = y + 2;

                if (position.top + bounds.height > viewBounds.bottom && y > viewBoundCenter) {
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
        addListenerAll(html, "li", (el, event) => {
            event.stopPropagation();

            const data = datasetToData(el.dataset) as TData;

            this.#resolve(data);
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

type BlueprintWaitContextData<T extends string> = {
    value: T;
};

export { BlueprintMenu };
export type {
    BlueprintMenuGroup,
    BlueprintMenuGroupEntry,
    BlueprintMenuOptions,
    BlueprintWaitContextData,
};
