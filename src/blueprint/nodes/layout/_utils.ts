import { ExtendedContainer, PixiLayoutGraphics } from "blueprint";

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

function elementOffset(el: ExtendedContainer) {
    return el.offsetBlock ?? 0;
}

export { elementOffset, getElementHeight, getElementSize, getElementWidth };
