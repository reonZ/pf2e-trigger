import {
    BlueprintConnectionsLayer,
    BlueprintGridLayer,
    BlueprintMenu,
    BlueprintNodesLayer,
} from "blueprint";
import { TriggerData, TriggerDataCollection, TriggerDataSource, TriggerNodeData } from "data";
import { createHookList, distanceBetweenPoints, MODULE, PersistentHook } from "module-helpers";
import { EventKey } from "schema";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #initialized = false;
    #parent: BlueprintMenu | undefined;
    #trigger: string | null = null;
    #triggers = new TriggerDataCollection();
    #hitArea = new PIXI.Rectangle();
    #gridLayer: BlueprintGridLayer;
    #dragLayer: PIXI.Container;
    #connectionsLayer: BlueprintConnectionsLayer;
    #nodesLayer: BlueprintNodesLayer;
    #hooks: PersistentHook;

    constructor() {
        super({
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        this.stage.addChild(
            (this.#gridLayer = new BlueprintGridLayer()),
            (this.#dragLayer = new PIXI.Container())
        );

        this.#dragLayer.addChild(
            (this.#connectionsLayer = new BlueprintConnectionsLayer()),
            (this.#nodesLayer = new BlueprintNodesLayer())
        );

        this.stage.hitArea = this.#hitArea;
        this.stage.eventMode = "static";

        this.#hooks = createHookList([
            { path: MODULE.path("addTrigger"), listener: this.#onAddTrigger.bind(this) },
            { path: MODULE.path("updateTrigger"), listener: this.#onUpdateTrigger.bind(this) },
            { path: MODULE.path("deleteTrigger"), listener: this.#onDeleteTrigger.bind(this) },
        ]);

        this.view.addEventListener("drop", this.#onDropCanvasData.bind(this));

        MODULE.debug(this);
    }

    get parent(): BlueprintMenu | undefined {
        return this.#parent;
    }

    get parentElement(): HTMLElement | undefined {
        return this.parent?.element;
    }

    get trigger(): TriggerData | undefined {
        return this.getTrigger(this.#trigger);
    }

    get triggers(): TriggerDataCollection {
        return this.#triggers;
    }

    initialize(parent: BlueprintMenu) {
        if (this.#initialized) return;

        this.#initialized = true;
        this.#parent = parent;

        this.#gridLayer.initialize(this);

        this.#hooks.activate();

        this.parentElement?.prepend(this.view);
        this.resizeAll();
    }

    destroy(removeView?: boolean, stageOptions?: PIXI.IDestroyOptions | boolean) {
        this.stage.removeAllListeners();

        this.#hooks.disable();

        super.destroy(true, true);
    }

    resizeAll() {
        const parent = this.parentElement;
        if (!parent) return;

        this.renderer.resize(parent.clientWidth, parent.clientHeight);

        this.#gridLayer.width = this.screen.width;
        this.#gridLayer.height = this.screen.height;

        this.#hitArea.width = this.screen.width;
        this.#hitArea.height = this.screen.height;

        this.render();
    }

    getTrigger(id: Maybe<string>) {
        return id ? this.triggers.get(id) : undefined;
    }

    setTrigger(id: Maybe<string>) {
        if (this.#trigger !== id) {
            this.#clear();
            this.#trigger = id ?? null;
            this.#draw();
        }

        this.parent?.refresh(true);
        this.resetPosition();
    }

    createTrigger({ event, name, position }: CreateTriggerOptions) {
        try {
            const node = new TriggerNodeData({ type: "event", key: event, position });
            const trigger = new TriggerData({
                name,
                _nodes: [node.toObject()],
            });

            this.triggers.add(trigger);
        } catch (error) {
            MODULE.error("An error occured while creating a new trigger.", error);
        }
    }

    resetPosition() {
        const position = this.#dragLayer.position;
        const distance = distanceBetweenPoints(position, { x: 0, y: 0 });
        if (distance === 0) return;

        CanvasAnimation.animate(
            [
                { parent: position, attribute: "x", to: 0 },
                { parent: position, attribute: "y", to: 0 },
            ],
            { duration: distance / 4 }
        );
    }

    // _onTriggerAdd(id: string): void {
    //     this.setTrigger(id);
    // }

    // _onTriggerDelete(id: string) {
    //     if (this.#trigger === id) {
    //         this.setTrigger(null);
    //     } else {
    //         this.parent?.refresh();
    //     }
    // }

    // _onTriggerUpdate(trigger: TriggerData, changed: TriggerDataSource): void {
    //     this.parent?.refresh();
    // }

    #onAddTrigger(trigger: TriggerData, collection: TriggerDataCollection) {
        this.setTrigger(trigger.id);
    }

    #onUpdateTrigger(
        trigger: TriggerData,
        changed: DeepPartial<TriggerDataSource>,
        collection: TriggerDataCollection
    ) {}

    #onDeleteTrigger(trigger: TriggerData, collection: TriggerDataCollection) {}

    #draw() {
        const trigger = this.trigger;
        if (!trigger) return;

        this.#nodesLayer.draw(trigger);

        this.stage.on("pointerdown", this.#onPointerDown, this);
    }

    #clear() {
        this.#trigger = null;

        this.#nodesLayer.clear();

        this.stage.removeAllListeners();

        // for (const layer of [this.#nodesLayer, this.#connectionsLayer]) {
        //     layer.removeAllListeners();

        //     const removed = layer.removeChildren();

        //     for (let i = 0; i < removed.length; ++i) {
        //         removed[i].destroy(true);
        //     }
        // }
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 2) return;

        // this.#drag = { origin: subtractPoints(event.global, this.stage.position) };

        // this.stage.on("pointerup", this.#onPointerUp, this);
        // this.stage.on("pointerupoutside", this.#onPointerUp, this);
        // this.stage.on("pointermove", this.#onDragMove, this);
    }

    #onDropCanvasData(event: DragEvent) {
        // const data = TextEditor.getDragEventData(event) as unknown as DropCanvasData;
        // if (
        //     !R.isPlainObject(data) ||
        //     !["Item", "Macro"].includes(data.type ?? "") ||
        //     !R.isString(data.uuid)
        // )
        //     return;
        // const document = fromUuidSync<ClientDocument | CompendiumIndexData>(data.uuid);
        // if (!document) return;
        // const localPoint = this.getLocalCoordinates(event);
        // for (const node of this.nodes) {
        //     const dropped = node.onDropDocument(localPoint, document);
        //     if (dropped) return;
        // }
    }
}

type CreateTriggerOptions = {
    event: EventKey;
    name?: string;
    position?: Point;
};

export { Blueprint };
