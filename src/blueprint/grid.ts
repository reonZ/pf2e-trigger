class BlueprintGridLayer extends PIXI.TilingSprite {
    #gridSize: number;
    #textureSize: number;
    #grid = new PIXI.Graphics();

    constructor() {
        const gridSize = 16;
        const textureSize = gridSize * 10;

        const renderTexture = PIXI.RenderTexture.create({
            width: textureSize,
            height: textureSize,
            resolution: window.devicePixelRatio,
        });

        super(renderTexture);

        this.#gridSize = gridSize;
        this.#textureSize = textureSize;
    }

    get grid(): PIXI.Graphics {
        return this.#grid;
    }

    get gridSize(): number {
        return this.#gridSize;
    }

    get textureSize(): number {
        return this.#textureSize;
    }

    initialize(blueprint: PIXI.Application) {
        const grid = this.grid;
        const textureSize = this.textureSize;

        for (let i = 0; i <= 10; i++) {
            const size = this.gridSize * i;
            const color = i === 0 || i === 10 ? 0x000000 : 0x808080;

            grid.lineStyle(1, color, 0.2, 1);

            grid.moveTo(0, size);
            grid.lineTo(textureSize, size);

            grid.moveTo(size, 0);
            grid.lineTo(size, textureSize);
        }

        blueprint.renderer.render(grid, { renderTexture: this.texture });
    }
}

interface BlueprintGridLayer extends PIXI.TilingSprite {
    get texture(): PIXI.RenderTexture;
}

export { BlueprintGridLayer };
