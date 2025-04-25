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

    get layoutType(): "horizontal" | "vertical" {
        return this.#type;
    }

    get layoutSpacing(): number {
        return this.#spacing;
    }

    get layoutPadding(): LayoutPadding {
        return this.#padding;
    }

    get layoutAlign(): LayoutAlign {
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

type LayoutAlign = "center" | "start" | "end";

type LayoutGraphicsOptions = {
    spacing?: number;
    padding?: LayoutGraphicsPadding;
    align?: LayoutAlign;
};

type LayoutGraphicsPadding =
    | number
    | [x: number, y: number]
    | {
          x: number | [number, number];
          y: number | [number, number];
      };

type LayoutPadding = {
    x: [number, number];
    y: [number, number];
};

type ExtendedContainer = PIXI.Container & { offsetBlock?: number };

export { PixiLayoutGraphics };
export type { ExtendedContainer, LayoutGraphicsOptions };
