import { createTriggerNode } from "@node/trigger-nodes-list";
import { Trigger } from "@trigger/trigger";
import triggers from "@trigger/triggers";
import { ItemPF2e, MODULE, R, subtractPoints } from "module-helpers";
import { BlueprintConnectionsLayer } from "./layer/layer-connections";
import { BlueprintGridLayer } from "./layer/layer-grid";
import { BlueprintNodesLayer } from "./layer/layer-nodes";
import { BlueprintMenu } from "./menu";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #dragging: Point | null = null;
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

        const trigger = triggers.first();
        this.setTrigger(trigger);

        this.view.addEventListener("drop", this.#onDropCanvasData.bind(this));

        this.stage.on("pointerdown", this.#onPointerDown, this);

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

    reset() {
        this.#trigger = null;

        this.stage.removeAllListeners();

        this.#nodesLayer.reset();
        this.#connectionsLayer.reset();
    }

    setTrigger(trigger: Trigger) {
        this.reset();

        this.#trigger = trigger;

        this.#nodesLayer.initialize();
        this.#connectionsLayer.initialize();
    }

    getLocalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x - viewBounds.x, y: point.y - viewBounds.y };
    }

    getGlobalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x + viewBounds.x, y: point.y + viewBounds.y };
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

        this.stage.on("pointerup", this.#onDragEnd, this);
        this.stage.on("pointerupoutside", this.#onDragEnd, this);
        this.stage.on("pointermove", this.#onDragMove, this);
    }

    #onDragMove(event: PIXI.FederatedPointerEvent) {
        if (!this.#dragging) {
            this.#dragging = subtractPoints(event.global, this.stage.position);
            this.#nodesLayer.interactiveChildren = false;
            return;
        }

        const { x, y } = subtractPoints(event.global, this.#dragging);

        this.#hitArea.x = -x;
        this.#hitArea.y = -y;

        this.stage.cursor = "grabbing";
        this.stage.position.set(x, y);

        this.#gridLayer.reverseTilePosition(x, y);
    }

    async #onDragEnd(event: PIXI.FederatedPointerEvent) {
        const wasDragging = !!this.#dragging;

        this.#dragging = null;
        this.#nodesLayer.interactiveChildren = true;

        this.stage.cursor = "default";
        this.stage.off("pointerup", this.#onDragEnd, this);
        this.stage.off("pointerupoutside", this.#onDragEnd, this);
        this.stage.off("pointermove", this.#onDragMove, this);

        if (wasDragging || !this.trigger) return;

        const { x, y } = event.global;
        const result = await BlueprintMenu.open(this, { x, y });
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
