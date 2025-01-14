import { Blueprint } from "@blueprint/blueprint";
import { TriggerData } from "@data/data-trigger";
import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationPosition,
    ApplicationRenderOptions,
    htmlQuery,
    render,
} from "module-helpers";

abstract class BlueprintMenu<TReturn extends any> extends foundry.applications.api
    .ApplicationV2<BlueprintMenuOptions> {
    #resolve: BlueprintMenuResolve<TReturn>;
    #blueprint: Blueprint;
    #target: Point | PIXI.Container;

    protected constructor(
        blueprint: Blueprint,
        target: Point | PIXI.Container,
        resolve: BlueprintMenuResolve<TReturn>,
        options?: DeepPartial<BlueprintMenuOptions>
    ) {
        super(options);

        this.#blueprint = blueprint;
        this.#resolve = resolve;
        this.#target = target;
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

    abstract get template(): string;

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): TriggerData | null {
        return this.blueprint.trigger;
    }

    get view() {
        return this.blueprint.view;
    }

    get target(): Point | PIXI.Container {
        return this.#target;
    }

    get resolve(): BlueprintMenuResolve<TReturn> {
        return this.#resolve;
    }

    async close(options?: ApplicationClosingOptions) {
        return super.close({ animate: false });
    }

    _onClose() {
        this.#resolve(null);
    }

    protected _renderHTML(context: object, options: ApplicationRenderOptions): Promise<string> {
        return render(this.template, context);
    }

    protected _replaceHTML(
        result: string,
        content: HTMLElement,
        options: ApplicationRenderOptions
    ): void {
        content.innerHTML = result;
        this._activateListeners(content);
    }

    protected _updatePosition(position: ApplicationPosition) {
        const menu = htmlQuery(this.element, ".menu");
        if (!menu) return position;

        Object.assign(menu.style, this.options.style ?? {});

        const target = this.target;
        const bounds = menu?.getBoundingClientRect();
        const viewBounds = this.view.getBoundingClientRect();

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

        if (y + bounds.height > viewBounds.bottom && y > viewBounds.height / 2) {
            y = mark.top.y - bounds.height + 2;
        }

        Object.assign(menu.style, {
            left: `${mark.top.x}px`,
            top: `${y}px`,
            minWidth: mark.width,
        });

        return position;
    }

    protected _activateListeners(html: HTMLElement) {
        html.addEventListener("click", () => this.close());
    }
}

type BlueprintMenuOptions = ApplicationConfiguration & {
    style: Partial<CSSStyleDeclaration>;
};

type BlueprintMenuResolve<T> = (value: T | null | PromiseLike<T | null>) => void;

export { BlueprintMenu };
export type { BlueprintMenuResolve, BlueprintMenuOptions };
