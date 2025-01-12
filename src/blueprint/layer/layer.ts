import { Blueprint } from "@blueprint/blueprint";
import { TriggerData } from "@data/data-trigger";

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

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get renderer() {
        return this.blueprint.renderer;
    }

    get screen(): PIXI.Rectangle {
        return this.blueprint.screen;
    }

    get trigger(): TriggerData | null {
        return this.blueprint.trigger;
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
