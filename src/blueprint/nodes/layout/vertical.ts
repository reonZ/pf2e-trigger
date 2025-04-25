import {
    elementOffset,
    ExtendedContainer,
    getElementHeight,
    getElementWidth,
    LayoutGraphicsOptions,
    PixiLayoutGraphics,
} from "blueprint";
import { R } from "module-helpers";

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

        return (innerWidth ?? 0) + R.sum(this.layoutPadding.x);
    }

    get totalHeight(): number {
        return (
            R.sumBy(this.children, getElementHeight) +
            Math.max(this.children.length - 1, 0) * this.layoutSpacing +
            R.sum(this.layoutPadding.y)
        );
    }

    computeLayout() {
        const padding = this.layoutPadding;
        const maxWidth = this.totalWidth;

        let offset = padding.y[0];

        const horizontalAlign: (child: ExtendedContainer) => number =
            this.layoutAlign === "start"
                ? (child) => padding.x[0] + elementOffset(child)
                : this.layoutAlign === "end"
                ? (child) => maxWidth - padding.x[1] - elementOffset(child) - getElementWidth(child)
                : (child) => (maxWidth - getElementWidth(child)) / 2;

        for (const child of this.children) {
            child.x = horizontalAlign(child);
            child.y = offset;
            offset += getElementHeight(child) + this.layoutSpacing;
        }
    }
}

type VerticalLayoutOptions = LayoutGraphicsOptions;

export { VerticalLayoutGraphics };
