import { BlueprintNode } from "./blueprint-node";
import { BlueprintNodeChild } from "./node-child";

class BlueprintNodeBorder extends BlueprintNodeChild {
    #border: PIXI.Graphics;
    #mask: PIXI.Graphics;

    constructor(parent: BlueprintNode) {
        super(parent);

        parent.addChild(this);

        this.#border = this.addChild(new PIXI.Graphics());
        this.#mask = this.addChild(new PIXI.Graphics());

        parent.mask = this.#mask;
    }

    refresh(): void {
        throw new Error("Method not implemented.");
    }

    paint(width: number): void {
        this.#mask.clear();
        this.#border.clear();

        const height = this.parent.height;
        const borderWidth = 2;
        const borderRadius = 10;
        const borderOffset = borderWidth / 2;

        this.#mask.beginFill(0x555555);
        this.#mask.drawRoundedRect(0, 0, width, height, borderRadius);
        this.#mask.endFill();

        this.#border.lineStyle({ color: 0x0, width: borderWidth, alpha: 0.5 });
        this.#border.drawRoundedRect(
            borderOffset,
            borderOffset,
            width - borderWidth,
            height - borderWidth,
            borderRadius
        );
    }
}

export { BlueprintNodeBorder };
