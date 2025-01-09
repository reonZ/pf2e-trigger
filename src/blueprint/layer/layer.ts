import { Blueprint } from "@blueprint/blueprint";
import { Trigger } from "@trigger/trigger";

abstract class BlueprintLayer<T extends PIXI.DisplayObject> extends PIXI.Container<T> {
    #blueprint: Blueprint;

    constructor(blueprint: Blueprint) {
        super();

        this.#blueprint = blueprint;

        blueprint.stage.addChild(this);
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): Trigger | null {
        return this.blueprint.trigger;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get renderer() {
        return this.blueprint.renderer;
    }

    get screen(): PIXI.Rectangle {
        return this.blueprint.screen;
    }

    abstract initialize(): void;

    reset() {
        this.removeAllListeners();

        const removed = this.removeChildren();
        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }

    destroy(options?: boolean | PIXI.IDestroyOptions) {
        super.destroy(true);
    }
}

export { BlueprintLayer };
