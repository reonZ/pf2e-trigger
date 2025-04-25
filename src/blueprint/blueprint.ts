import {
    BlueprintApplication,
    BlueprintConnectionsLayer,
    BlueprintEntry,
    BlueprintGridLayer,
    BlueprintMenu,
    BlueprintNode,
    BlueprintNodesLayer,
} from "blueprint";
import { NodeEntryId, PartialTriggerNodeDataSource, TriggerData, WorldTriggers } from "data";
import { distanceToPoint, getSetting, MODULE, subtractPoint } from "module-helpers";
import { EventKey, getFilterGroups } from "schema";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #initialized = false;
    #parent: BlueprintApplication | undefined;
    #trigger: string | null = null;
    #worldTriggers: WorldTriggers;
    #hitArea = new PIXI.Rectangle();
    #gridLayer: BlueprintGridLayer;
    #connectionsLayer: BlueprintConnectionsLayer;
    #nodesLayer: BlueprintNodesLayer;
    #drag: { origin: Point; dragging?: boolean } | null = null;

    constructor() {
        super({
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        this.#worldTriggers = getSetting<WorldTriggers>("world-triggers").clone();

        this.stage.addChild(
            (this.#gridLayer = new BlueprintGridLayer()),
            (this.#connectionsLayer = new BlueprintConnectionsLayer(this)),
            (this.#nodesLayer = new BlueprintNodesLayer(this))
        );

        this.stage.hitArea = this.#hitArea;
        this.stage.eventMode = "static";

        this.view.addEventListener("drop", this.#onDropCanvasData.bind(this));

        MODULE.debug("Blueprint\n", this);
    }

    get parent(): BlueprintApplication | undefined {
        return this.#parent;
    }

    get parentElement(): HTMLElement | undefined {
        return this.parent?.element;
    }

    get trigger(): TriggerData | undefined {
        return this.getTrigger(this.#trigger);
    }

    get triggers(): foundry.abstract.EmbeddedCollection<TriggerData> {
        return this.#worldTriggers.triggers;
    }

    get nodesLayer(): BlueprintNodesLayer {
        return this.#nodesLayer;
    }

    get connectionsLayer(): BlueprintConnectionsLayer {
        return this.#connectionsLayer;
    }

    initialize(parent: BlueprintApplication) {
        if (this.#initialized) return;

        this.#initialized = true;
        this.#parent = parent;

        this.#gridLayer.initialize(this);

        this.parentElement?.prepend(this.view);
        this.resizeAll();
    }

    destroy(removeView?: boolean, stageOptions?: PIXI.IDestroyOptions | boolean) {
        this.stage.removeAllListeners();

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

    enableNodesInteraction(enabled: boolean) {
        this.#nodesLayer.interactiveChildren = enabled;
    }

    getBoundClientRect(): DOMRect {
        return this.view.getBoundingClientRect();
    }

    getLocalCoordinates(point: Point): Point {
        const viewBounds = this.getBoundClientRect();
        return { x: point.x - viewBounds.x, y: point.y - viewBounds.y };
    }

    getGlobalCoordinates(point: Point): Point {
        const viewBounds = this.getBoundClientRect();
        return { x: point.x + viewBounds.x, y: point.y + viewBounds.y };
    }

    getTrigger(id: Maybe<string>): TriggerData | undefined {
        return id ? this.triggers.get(id) : undefined;
    }

    setTrigger(id: Maybe<string>) {
        if (this.#trigger !== id) {
            this.#clear();
            this.#trigger = id ?? null;
            this.#draw();
        }

        this.parent?.refresh();
        this.resetPosition();
    }

    async createTrigger({ event, name, position }: CreateTriggerOptions) {
        try {
            const [trigger] = await this.#worldTriggers.createEmbeddedDocuments("Trigger", [
                {
                    name,
                    nodes: [
                        {
                            key: event,
                            type: "event",
                            position,
                        },
                    ],
                },
            ]);

            this.setTrigger(trigger.id);
        } catch (error) {
            MODULE.error("An error occured while creating a new trigger.", error);
        }
    }

    async deleteTrigger(id: string) {
        await this.#worldTriggers.deleteEmbeddedDocuments("Trigger", [id]);

        if (this.#trigger === id) {
            this.setTrigger(null);
        } else {
            this.parent?.refresh();
        }
    }

    async createNode(data: PartialTriggerNodeDataSource): Promise<BlueprintNode | undefined> {
        const trigger = this.trigger;
        if (!trigger) return;

        try {
            const [node] = await trigger.createEmbeddedDocuments("Node", [data]);
            return this.nodesLayer.add(node);
        } catch (error) {
            MODULE.error("An error occured while creating a new node.", error);
        }
    }

    getEntry(id: NodeEntryId): BlueprintEntry | undefined {
        return this.nodesLayer.get(id)?.getEntry(id);
    }

    resetPosition() {
        const distance = distanceToPoint(this.stage.position, { x: 0, y: 0 });
        if (distance === 0) return;

        CanvasAnimation.animate(
            [
                this.stage.position,
                this.#gridLayer.position,
                this.#gridLayer.tilePosition,
                this.#hitArea,
            ].flatMap((parent) => ["x", "y"].map((attribute) => ({ parent, attribute, to: 0 }))),
            { duration: distance / 4 }
        );
    }

    #draw() {
        const trigger = this.trigger;
        if (!trigger) return;

        this.nodesLayer.draw();
        this.connectionsLayer.draw();

        this.stage.on("pointerdown", this.#onPointerDown, this);
    }

    #clear() {
        this.#trigger = null;

        this.nodesLayer.clear();
        this.connectionsLayer.clear();

        this.stage.removeAllListeners();

        // for (const layer of [this.nodesLayer, this.#connectionsLayer]) {
        //     layer.removeAllListeners();

        //     const removed = layer.removeChildren();

        //     for (let i = 0; i < removed.length; ++i) {
        //         removed[i].destroy(true);
        //     }
        // }
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 2) return;

        this.#drag = { origin: subtractPoint(event.global, this.stage.position) };

        this.stage.on("pointerup", this.#onPointerUp, this);
        this.stage.on("pointerupoutside", this.#onPointerUp, this);
        this.stage.on("pointermove", this.#onDragMove, this);
    }

    #onDragMove(event: PIXI.FederatedPointerEvent) {
        if (!this.#drag) return;

        const { origin, dragging } = this.#drag;

        if (!dragging) {
            const target = subtractPoint(event.global, this.stage.position);
            const distance = distanceToPoint(target, origin);

            if (distance < 10) return;
        }

        this.#drag.dragging = true;

        const { x, y } = subtractPoint(event.global, origin);

        this.#hitArea.x = -x;
        this.#hitArea.y = -y;

        this.stage.cursor = "grabbing";
        this.stage.position.set(x, y);

        this.#gridLayer.position.set(-x, -y);
        this.#gridLayer.tilePosition.set(x, y);
    }

    async #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const wasDragging = !!this.#drag?.dragging;

        this.#drag = null;
        this.nodesLayer.interactiveChildren = true;

        this.stage.cursor = "default";
        this.stage.off("pointerup", this.#onPointerUp, this);
        this.stage.off("pointerupoutside", this.#onPointerUp, this);
        this.stage.off("pointermove", this.#onDragMove, this);

        if (!wasDragging && this.trigger) {
            this.#onContextMenu(event.global);
        }
    }

    async #onContextMenu({ x, y }: Point) {
        const result = await BlueprintMenu.waitNodes(this, getFilterGroups(), x, y);
        if (!result) return;

        const { key, type } = result;
        const node = await this.createNode({ key, type, position: { x, y } });
        if (!node) return;

        const center = { x: x - node.width / 2, y: y - node.height / 2 };
        const point = subtractPoint(center, this.stage.position);
        node.setPosition(point);
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
