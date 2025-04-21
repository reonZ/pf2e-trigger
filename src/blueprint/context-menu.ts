import {
    addListenerAll,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationPosition,
    ApplicationRenderOptions,
    assignStyle,
    render,
} from "module-helpers";
import { Blueprint } from "./blueprint";
import { TriggerData } from "data";
import { NodeFilterGroup } from "schema";

class BlueprintContextMenu<T extends DOMStringMap> extends foundry.applications.api.ApplicationV2<
    ContextMenuConfigs<T>
> {
    #blueprint: Blueprint;
    #groups: NodeFilterGroup[];
    #resolve: ContextMenuResolve<T>;
    #target: Point | PIXI.Container;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        window: {
            resizable: false,
            minimizable: false,
            frame: false,
            positioned: true,
        },
        id: "pf2e-trigger-context-menu",
    };

    constructor({ blueprint, groups, resolve, target, ...options }: ContextMenuOptions<T>) {
        super(options);

        this.#blueprint = blueprint;
        this.#groups = groups;
        this.#resolve = resolve;
        this.#target = target;
    }

    static wait<T extends DOMStringMap>(
        configs: Omit<ContextMenuOptions<T>, "resolve">
    ): Promise<null | T> {
        return new Promise((resolve) => {
            new BlueprintContextMenu<T>({ ...configs, resolve }).render(true);
        });
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): TriggerData | undefined {
        return this.blueprint.trigger;
    }

    get target(): Point | PIXI.Container {
        return this.#target;
    }

    get fontSize(): number {
        // TODO get the font size of the target if not a Point
        return 15;
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
            groups: this.#groups,
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

        assignStyle(el, { fontSize: `${this.fontSize}px` });

        const target = this.target;
        const bounds = el.getBoundingClientRect();
        const viewBounds = this.blueprint.getBoundClientRect();

        const mark: { top: Point; bottom: Point; width?: string } = (() => {
            if (!(target instanceof PIXI.Container)) {
                const { x, y } = this.blueprint.getGlobalCoordinates(target);
                const point = { x: x - bounds.width / 2, y };
                return { top: point, bottom: point };
            }

            const { x, y } = target.getGlobalPosition();

            return {
                width: `${target.width}px`,
                top: this.blueprint.getGlobalCoordinates({ x, y: y - 1 }),
                bottom: this.blueprint.getGlobalCoordinates({ x, y: y + target.height }),
            };
        })();

        let y = mark.bottom.y - 1;

        if (y + bounds.height > viewBounds.bottom) {
            y = mark.top.y - bounds.height + 2;
        }

        if (y < viewBounds.top) {
            y = viewBounds.top;
        }

        assignStyle(el, {
            left: `${mark.top.x}px`,
            top: `${y}px`,
            minWidth: mark.width,
            maxHeight: `${viewBounds.height}px`,
        });

        return position;
    }

    #activateListeners(html: HTMLElement) {
        addListenerAll(html, "li", (event, el) => {
            event.stopPropagation();
            this.#resolve(el.dataset as T);
            this.close();
        });
    }
}

type ContextMenuContext = {
    groups: NodeFilterGroup[];
};

type ContextMenuConfigs<T extends DOMStringMap> = ApplicationConfiguration & {
    fontSize: number;
    resolve: ContextMenuResolve<T>;
};

type ContextMenuOptions<T extends DOMStringMap> = DeepPartial<ApplicationConfiguration> & {
    blueprint: Blueprint;
    groups: NodeFilterGroup[];
    target: Point | PIXI.Container;
    resolve: ContextMenuResolve<T>;
};

type ContextMenuResolve<T extends DOMStringMap> = (value: T | null) => void;

export { BlueprintContextMenu };
