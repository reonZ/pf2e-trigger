import { R } from "module-helpers";

type LayoutRawPadding = {
    x: number | [number, number];
    y: number | [number, number];
};

type LayouPadding = {
    x: [number, number];
    y: [number, number];
};

class PixiLayoutGraphics extends PIXI.Graphics<PIXI.Container> {
    #type: "horizontal" | "vertical";
    #spacing: number;
    #padding: LayouPadding;

    constructor(
        type: "horizontal" | "vertical",
        spacing: number,
        padding: LayoutRawPadding | number | [x: number, y: number] = 0
    ) {
        super();

        padding = R.isNumber(padding) ? { x: [padding, padding], y: [padding, padding] } : padding;
        padding = R.isArray(padding) ? { x: padding[0], y: padding[1] } : padding;

        this.#type = type;
        this.#spacing = spacing;
        this.#padding = {
            x: R.isNumber(padding.x) ? [padding.x, padding.x] : padding.x,
            y: R.isNumber(padding.y) ? [padding.y, padding.y] : padding.y,
        };
    }

    get type(): "horizontal" | "vertical" {
        return this.#type;
    }

    get spacing(): number {
        return this.#spacing;
    }

    get padding(): LayouPadding {
        return this.#padding;
    }

    get lastChild(): Rectangle {
        return this.children.at(-1) ?? { x: 0, y: 0, width: 0, height: 0 };
    }

    get currentOffset(): number {
        const lastChild = this.lastChild;
        return this.type === "horizontal"
            ? lastChild.x + lastChild.width
            : lastChild.y + lastChild.height;
    }

    get nextOffset(): number {
        return this.children.length
            ? this.currentOffset + this.spacing
            : this.padding[this.type === "horizontal" ? "x" : "y"][0];
    }

    get totalWidth(): number {
        if (this.type === "horizontal") {
            return this.currentOffset + this.padding.x[1];
        }

        const maxWidth = R.pipe(
            this.children,
            R.map((child) => {
                return (
                    child.x + (child instanceof PixiLayoutGraphics ? child.totalWidth : child.width)
                );
            }),
            R.firstBy([R.identity(), "desc"])
        );

        return (maxWidth ?? 0) + this.padding.x[1];
    }

    get totalHeight(): number {
        if (this.type === "vertical") {
            return this.currentOffset + this.padding.y[1];
        }

        const maxHeight = R.pipe(
            this.children,
            R.map((child) => {
                return (
                    child.y +
                    (child instanceof PixiLayoutGraphics ? child.totalHeight : child.height)
                );
            }),
            R.firstBy([R.identity(), "desc"])
        );

        return (maxHeight ?? 0) + this.padding.y[1];
    }

    /**
     * @param offset number only offsets the layout direction
     */
    addToLayout<T extends PIXI.Container | PixiLayoutGraphics>(
        child: T,
        offset: number | [x: number, y: number] | Partial<Point> = {}
    ): T {
        offset = R.isArray(offset) ? { x: offset[0], y: offset[1] } : offset;

        if (this.type === "horizontal") {
            offset = R.isNumber(offset) ? { x: offset } : offset;
            child.x = this.nextOffset + (offset.x ?? 0);
            child.y = this.padding.y[0] + (offset.y ?? 0);
        } else {
            offset = R.isNumber(offset) ? { y: offset } : offset;
            child.x = this.padding.x[0] + (offset.x ?? 0);
            child.y = this.nextOffset + (offset.y ?? 0);
        }

        return this.addChild(child);
    }
}

// class BlueprintNodeBody extends PIXI.Graphics {
//     #spacing: number;
//     #inputs: PixiLayoutGraphics;
//     #outputs: PixiLayoutGraphics;

//     constructor(spacing: number, rowSpacing: number) {
//         super();

//         this.#spacing = spacing;
//         this.#inputs = new PixiLayoutGraphics("vertical", rowSpacing);
//         this.#outputs = new PixiLayoutGraphics("vertical", rowSpacing);

//         this.addChild(this.#inputs);
//         this.addChild(this.#outputs);
//     }

//     get spacing(): number {
//         return this.#spacing;
//     }

//     get inputs(): PixiLayoutGraphics {
//         return this.#inputs;
//     }

//     get outputs(): PixiLayoutGraphics {
//         return this.#outputs;
//     }

//     get minWidth(): number {
//         return this.inputs.totalWidth + this.spacing + this.outputs.totalWidth;
//     }

//     get totalHeight(): number {
//         return Math.max(this.inputs.totalHeight, this.outputs.totalHeight);
//     }
// }

export { PixiLayoutGraphics };
