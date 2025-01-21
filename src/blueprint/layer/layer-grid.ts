import { Blueprint } from "blueprint/blueprint";

class BlueprintGridLayer extends PIXI.TilingSprite {
    #gridSize: number;
    #blueprint: Blueprint;
    #texture: PIXI.RenderTexture;

    constructor(blueprint: Blueprint, gridSize: number = 16) {
        const textureSize = gridSize * 10;
        const texture = PIXI.RenderTexture.create({
            width: textureSize * devicePixelRatio,
            height: textureSize * devicePixelRatio,
            resolution: devicePixelRatio,
        });

        super(texture, blueprint.screen.width, blueprint.screen.height);

        this.#gridSize = gridSize;
        this.#blueprint = blueprint;
        this.#texture = texture;

        this.#createGrid();

        blueprint.stage.addChild(this);
    }

    get gridSize(): number {
        return this.#gridSize;
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get renderer() {
        return this.blueprint.renderer;
    }

    reverseTilePosition(x: number, y: number) {
        this.position.set(-x, -y);
        this.tilePosition.set(x, y);
    }

    #createGrid() {
        const grid = new PIXI.Graphics();
        const textureSize = this.gridSize * 10;

        for (let i = 0; i <= 10; i++) {
            const size = this.gridSize * i;
            const color = i === 0 || i === 10 ? 0x000000 : 0x808080;

            grid.lineStyle(1, color, 0.2, 1);

            grid.moveTo(0, size);
            grid.lineTo(textureSize, size);

            grid.moveTo(size, 0);
            grid.lineTo(size, textureSize);
        }

        this.renderer.render(grid, { renderTexture: this.#texture });
    }
}

export { BlueprintGridLayer };
