import { BlueprintNodeChild } from "./blueprint-node-child";

class BlueprintNodeBorder extends BlueprintNodeChild {
    #border!: PIXI.Graphics;
    #mask!: PIXI.Graphics;

    initialize(): void {
        this.#border = this.addChild(new PIXI.Graphics());
        this.#mask = this.addChild(new PIXI.Graphics());

        this.parent.mask = this.#mask;
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
