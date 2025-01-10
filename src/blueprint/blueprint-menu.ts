import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationPosition,
    ApplicationRenderOptions,
    htmlQuery,
    render,
} from "module-helpers";
import { Blueprint } from "./blueprint";
import { Trigger } from "@trigger/trigger";
import { BlueprintNode } from "./node/blueprint-node";
import { BlueprintNodeEntry } from "./node/node-entry";

abstract class BlueprintMenu<TReturn extends any, TSource extends any> extends foundry.applications
    .api.ApplicationV2 {
    #resolve: (value: TReturn | null | PromiseLike<TReturn | null>) => void;
    #point: Point;
    #blueprint: Blueprint;
    #source: TSource;

    constructor(
        blueprint: Blueprint,
        point: Point,
        resolve: (value: TReturn | null | PromiseLike<TReturn | null>) => void,
        source: TSource,
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

    static open<TReturn extends any>(
        blueprint: Blueprint,
        point: Point,
        source?: BlueprintNode | BlueprintNodeEntry,
        options?: DeepPartial<ApplicationConfiguration>
    ): Promise<TReturn | null> {
        return new Promise<TReturn | null>((resolve) => {
            // @ts-expect-error
            const menu = new this(blueprint, point, resolve, source, options);
            menu.render(true);
        });
    }

    abstract get template(): string;

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get view() {
        return this.blueprint.view;
    }

    get trigger(): Trigger | null {
        return this.blueprint.trigger;
    }

    get source(): TSource {
        return this.#source;
    }

    get point(): Point {
        return this.#point;
    }

    get resolve(): (value: TReturn | null | PromiseLike<TReturn | null>) => void {
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

    protected _activateListeners(html: HTMLElement) {
        html.addEventListener("click", () => this.close());
    }
}

export { BlueprintMenu };
