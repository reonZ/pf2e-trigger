import { R } from "module-helpers";

abstract class PixiLayoutGraphics<
    TOptions extends LayoutGraphicsOptions = LayoutGraphicsOptions
> extends PIXI.Graphics<ExtendedContainer> {
    #type: "horizontal" | "vertical";
    #spacing: number;
    #padding: LayoutPadding;
    #align: LayoutAlign;

    declare offsetBlock: number | undefined;

    constructor(type: "horizontal" | "vertical", { padding, spacing, align }: TOptions) {
        super();

        padding ??= { x: 0, y: 0 };
        padding = R.isNumber(padding) ? { x: padding, y: padding } : padding;
        padding = R.isArray(padding) ? { x: padding[0], y: padding[1] } : padding;

        this.#type = type;
        this.#align = align ?? "start";
        this.#spacing = spacing ?? 0;
        this.#padding = {
            x: R.isNumber(padding.x) ? [padding.x, padding.x] : padding.x,
            y: R.isNumber(padding.y) ? [padding.y, padding.y] : padding.y,
        };
    }

    abstract get totalWidth(): number;
    abstract get totalHeight(): number;
    abstract computeLayout(): void;

    get type(): "horizontal" | "vertical" {
        return this.#type;
    }

    get spacing(): number {
        return this.#spacing;
    }

    get padding(): LayoutPadding {
        return this.#padding;
    }

    get align(): LayoutAlign {
        return this.#align;
    }

    addChild<T extends (PIXI.Container | PixiLayoutGraphics)[]>(...children: T): T[0] {
        const child = super.addChild(...(children as any));
        this.computeLayout();
        return child;
    }

    addChildWithOffset<T extends ExtendedContainer | PixiLayoutGraphics>(
        child: T,
        offsetBlock: number
    ): T {
        child.offsetBlock = offsetBlock;
        return this.addChild(child);
    }
}

class HorizontalLayoutGraphics extends PixiLayoutGraphics<HorizontalLayoutOptions> {
    #maxHeight: number | undefined;

    constructor({ maxHeight, ...options }: HorizontalLayoutOptions = {}) {
        options.align ??= "center";
        super("horizontal", options);
        this.#maxHeight = maxHeight;
    }

    get totalWidth(): number {
        return (
            R.sumBy(this.children, getElementWidth) +
            Math.max(this.children.length - 1, 0) * this.spacing +
            R.sum(this.padding.x)
        );
    }

    get totalHeight(): number {
        const innerHeight =
            this.#maxHeight ??
            R.pipe(this.children, R.map(getElementHeight), R.firstBy([R.identity(), "desc"]));

        return (innerHeight ?? 0) + R.sum(this.padding.y);
    }

    computeLayout() {
        const padding = this.padding;
        const maxHeight = this.totalHeight;

        let offset = padding.x[0];

        const verticalAlign: (child: ExtendedContainer) => number =
            this.align === "start"
                ? () => padding.y[0]
                : this.align === "end"
                ? (child) => maxHeight - padding.y[1] - getElementHeight(child)
                : (child) => (maxHeight - getElementHeight(child)) / 2;

        for (const child of this.children) {
            child.x = offset;
            child.y = verticalAlign(child);
            offset += getElementWidth(child) + this.spacing;
        }
    }
}

class VerticalLayoutGraphics extends PixiLayoutGraphics<VerticalLayoutOptions> {
    constructor(options: VerticalLayoutOptions = {}) {
        super("vertical", options);
    }

    get totalWidth(): number {
        const innerWidth = R.pipe(
            this.children,
            R.map(getElementWidth),
            R.firstBy([R.identity(), "desc"])
        );

        return (innerWidth ?? 0) + R.sum(this.padding.x);
    }

    get totalHeight(): number {
        return (
            R.sumBy(this.children, getElementHeight) +
            Math.max(this.children.length - 1, 0) * this.spacing +
            R.sum(this.padding.y)
        );
    }

    computeLayout() {
        const padding = this.padding;
        const maxWidth = this.totalWidth;

        let offset = padding.y[0];

        const horizontalAlign: (child: ExtendedContainer) => number =
            this.align === "start"
                ? (child) => padding.x[0] + elementOffset(child)
                : this.align === "end"
                ? (child) => maxWidth - padding.x[1] - elementOffset(child) - getElementWidth(child)
                : (child) => (maxWidth - getElementWidth(child)) / 2;

        for (const child of this.children) {
            child.x = horizontalAlign(child);
            child.y = offset;
            offset += getElementHeight(child) + this.spacing;
        }
    }
}

function elementOffset(el: ExtendedContainer) {
    return el.offsetBlock ?? 0;
}

function getElementWidth(el: ExtendedContainer | PixiLayoutGraphics): number {
    return getElementSize(el, "x") + (el.offsetBlock ?? 0);
}

function getElementHeight(el: PIXI.Container | PixiLayoutGraphics): number {
    return getElementSize(el, "y");
}

function getElementSize(el: PIXI.Container | PixiLayoutGraphics, size: "x" | "y"): number {
    return el instanceof PixiLayoutGraphics
        ? el[size === "x" ? "totalWidth" : "totalHeight"]
        : el[size === "x" ? "width" : "height"];
}

type LayoutAlign = "center" | "start" | "end";

type LayoutGraphicsOptions = {
    spacing?: number;
    padding?: LayoutGraphicsPadding;
    align?: LayoutAlign;
};

type HorizontalLayoutOptions = LayoutGraphicsOptions & {
    maxHeight?: number;
};

type VerticalLayoutOptions = LayoutGraphicsOptions;

type ExtendedContainer = PIXI.Container & { offsetBlock?: number };

type LayoutPadding = {
    x: [number, number];
    y: [number, number];
};

type LayoutGraphicsPadding =
    | number
    | [x: number, y: number]
    | {
          x: number | [number, number];
          y: number | [number, number];
      };

export { getElementSize, HorizontalLayoutGraphics, VerticalLayoutGraphics };
export type { PixiLayoutGraphics };
