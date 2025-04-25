import {
    ExtendedContainer,
    getElementHeight,
    getElementWidth,
    LayoutGraphicsOptions,
    PixiLayoutGraphics,
} from "blueprint";
import { R } from "module-helpers";

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
            Math.max(this.children.length - 1, 0) * this.layoutSpacing +
            R.sum(this.layoutPadding.x)
        );
    }

    get totalHeight(): number {
        const innerHeight =
            this.#maxHeight ??
            R.pipe(this.children, R.map(getElementHeight), R.firstBy([R.identity(), "desc"]));

        return (innerHeight ?? 0) + R.sum(this.layoutPadding.y);
    }

    computeLayout() {
        const padding = this.layoutPadding;
        const maxHeight = this.totalHeight;

        let offset = padding.x[0];

        const verticalAlign: (child: ExtendedContainer) => number =
            this.layoutAlign === "start"
                ? () => padding.y[0]
                : this.layoutAlign === "end"
                ? (child) => maxHeight - padding.y[1] - getElementHeight(child)
                : (child) => (maxHeight - getElementHeight(child)) / 2;

        for (const child of this.children) {
            child.x = offset;
            child.y = verticalAlign(child);
            offset += getElementWidth(child) + this.layoutSpacing;
        }
    }
}

type HorizontalLayoutOptions = LayoutGraphicsOptions & {
    maxHeight?: number;
};

export { HorizontalLayoutGraphics };
