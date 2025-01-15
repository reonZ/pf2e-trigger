import { Blueprint } from "@blueprint/blueprint";
import { TriggerData } from "@data/data-trigger";
import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationPosition,
    ApplicationRenderOptions,
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
        classes: ["pf2e-trigger-blueprint-menu"],
    };

    abstract get template(): string;
    protected abstract _activateListeners(html: HTMLElement): void;

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
        content.tabIndex = 0;

        this._activateListeners(content);
    }

    protected _onFirstRender(context: object, options: ApplicationRenderOptions): void {
        requestAnimationFrame(() => {
            this.element.addEventListener("blur", (event) => {
                this.close();
            });

            this.element.focus();
        });
    }

    protected _updatePosition(position: ApplicationPosition) {
        const el = this.element;

        Object.assign(el.style, this.options.style ?? {});

        const target = this.target;
        const bounds = el.getBoundingClientRect();
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

        Object.assign(el.style, {
            left: `${mark.top.x}px`,
            top: `${y}px`,
            minWidth: mark.width,
        });

        return position;
    }
}

type BlueprintMenuOptions = ApplicationConfiguration & {
    style: Partial<CSSStyleDeclaration>;
};

type BlueprintMenuResolve<T> = (value: T | null | PromiseLike<T | null>) => void;

export { BlueprintMenu };
export type { BlueprintMenuOptions, BlueprintMenuResolve };
