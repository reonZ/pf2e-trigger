import { createTriggerNode } from "@node/trigger-nodes-list";
import { Trigger } from "@trigger/trigger";
import { ItemPF2e, MODULE, R, subtractPoints } from "module-helpers";
import { BlueprintConnectionsLayer } from "./layer/layer-connections";
import { BlueprintGridLayer } from "./layer/layer-grid";
import { BlueprintNodesLayer } from "./layer/layer-nodes";
import { BlueprintNodesMenu } from "./nodes-menu";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #drag: { origin: Point; dragging?: boolean } | null = null;
    #trigger: Trigger | null = null;
    #gridLayer: BlueprintGridLayer;
    #connectionsLayer: BlueprintConnectionsLayer;
    #nodesLayer: BlueprintNodesLayer;
    #hitArea: PIXI.Rectangle;

    constructor(parent: HTMLElement) {
        super({
            backgroundAlpha: 0,
            width: parent.clientWidth,
            height: parent.clientHeight,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        this.#hitArea = new PIXI.Rectangle(0, 0, this.screen.width, this.screen.height);

        this.stage.hitArea = this.#hitArea;
        this.stage.eventMode = "static";

        this.#gridLayer = new BlueprintGridLayer(this);
        this.#nodesLayer = new BlueprintNodesLayer(this);
        this.#connectionsLayer = new BlueprintConnectionsLayer(this);

        this.#gridLayer.zIndex = 0;
        this.#connectionsLayer.zIndex = 1;
        this.#nodesLayer.zIndex = 2;

        this.stage.sortChildren();

        this.view.addEventListener("drop", this.#onDropCanvasData.bind(this));

        parent.prepend(this.view);

        MODULE.debug(this);
    }

    get trigger(): Trigger | null {
        return this.#trigger;
    }

    get layers(): {
        grid: BlueprintGridLayer;
        nodes: BlueprintNodesLayer;
        connections: BlueprintConnectionsLayer;
    } {
        return {
            grid: this.#gridLayer,
            nodes: this.#nodesLayer,
            connections: this.#connectionsLayer,
        };
    }

    initialize() {
        this.stage.on("pointerdown", this.#onPointerDown, this);

        this.#nodesLayer.initialize();
        this.#connectionsLayer.initialize();
    }

    reset() {
        this.#trigger = null;

        this.stage.removeAllListeners();

        this.#nodesLayer.reset();
        this.#connectionsLayer.reset();
    }

    setTrigger(trigger: Maybe<Trigger>) {
        if (this.trigger !== trigger) {
            this.reset();

            this.#trigger = trigger ?? null;

            if (trigger) {
                this.initialize();
            }
        }

        this.#resetPosition();
    }

    getLocalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x - viewBounds.x, y: point.y - viewBounds.y };
    }

    getGlobalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x + viewBounds.x, y: point.y + viewBounds.y };
    }

    #resetPosition() {
        this.stage.position.set(0, 0);
        this.#gridLayer.reverseTilePosition(0, 0);
    }

    #onDropCanvasData(event: DragEvent) {
        const data = TextEditor.getDragEventData(event) as unknown as DropCanvasData;
        if (!R.isPlainObject(data) || data.type !== "Item" || !R.isString(data.uuid)) return;

        const item = fromUuidSync<ItemPF2e | CompendiumIndexData>(data.uuid);
        if (item) {
            this.#onDropItem(event, item);
        }
    }

    #onDropItem(event: DragEvent, item: ItemPF2e | CompendiumIndexData) {
        const localPoint = this.getLocalCoordinates(event);

        for (const node of this.#nodesLayer.nodes()) {
            const dropped = node.onDropItem(localPoint, item);
            if (dropped) return;
        }
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 2) return;

        this.#drag = { origin: subtractPoints(event.global, this.stage.position) };

        this.stage.on("pointerup", this.#onPointerUp, this);
        this.stage.on("pointerupoutside", this.#onPointerUp, this);
        this.stage.on("pointermove", this.#onDragMove, this);
    }

    #onDragMove(event: PIXI.FederatedPointerEvent) {
        if (!this.#drag) return;

        const { origin, dragging } = this.#drag;

        if (!dragging) {
            const { x, y } = subtractPoints(event.global, this.stage.position);
            const distance = Math.hypot(x - origin.x, y - origin.y);

            if (distance < 10) return;
        }

        this.#drag.dragging = true;

        const { x, y } = subtractPoints(event.global, origin);

        this.#hitArea.x = -x;
        this.#hitArea.y = -y;

        this.stage.cursor = "grabbing";
        this.stage.position.set(x, y);

        this.#gridLayer.reverseTilePosition(x, y);
    }

    async #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const wasDragging = !!this.#drag?.dragging;

        this.#drag = null;
        this.#nodesLayer.interactiveChildren = true;

        this.stage.cursor = "default";
        this.stage.off("pointerup", this.#onPointerUp, this);
        this.stage.off("pointerupoutside", this.#onPointerUp, this);
        this.stage.off("pointermove", this.#onDragMove, this);

        if (wasDragging || !this.trigger) return;

        const { x, y } = event.global;
        const result = await BlueprintNodesMenu.open(this, { x, y });
        if (!result) return;

        const node = createTriggerNode({ ...result, id: fu.randomID(), x, y });
        if (!node) return;

        this.trigger.addNode(node);

        const blueprintNode = this.#nodesLayer.addNode(node);
        const center = {
            x: x - blueprintNode.width / 2,
            y: y - blueprintNode.height / 2,
        };

        const point = subtractPoints(center, this.stage.position);

        blueprintNode.setPosition(point);
    }
}

export { Blueprint };
