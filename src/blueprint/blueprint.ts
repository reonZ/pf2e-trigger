import { NodeRawData, processNodeData } from "data/data-node";
import {
    TriggerData,
    TriggerRawData,
    processTriggerData,
    serializeTrigger,
} from "data/data-trigger";
import { getTriggersDataMap } from "data/data-trigger-list";
import { MODULE, R, distanceBetweenPoints, info, setSetting, subtractPoints } from "module-helpers";
import { NodeType } from "schema/schema";
import { EventNodeKey, getSchema } from "schema/schema-list";
import { BlueprintConnectionsLayer } from "./layer/layer-connections";
import { BlueprintGridLayer } from "./layer/layer-grid";
import { BlueprintNodesLayer } from "./layer/layer-nodes";
import { BlueprintNodesMenu } from "./menu/blueprint-nodes-menu";
import { BlueprintNode } from "./node/blueprint-node";
import { VariableBlueprintNode } from "./node/blueprint-variable-node";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #triggers: Record<string, TriggerData>;
    #trigger: string | null = null;
    #hitArea: PIXI.Rectangle;
    #gridLayer: BlueprintGridLayer;
    #nodesLayer: BlueprintNodesLayer;
    #connectionsLayer: BlueprintConnectionsLayer;
    #drag: { origin: Point; dragging?: boolean } | null = null;

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

        this.#triggers = getTriggersDataMap();

        this.#gridLayer = new BlueprintGridLayer(this);
        this.#nodesLayer = new BlueprintNodesLayer(this);
        this.#connectionsLayer = new BlueprintConnectionsLayer(this);

        this.#sortLayers();

        this.view.addEventListener("drop", this.#onDropCanvasData.bind(this));

        parent.prepend(this.view);

        MODULE.debug(this);
    }

    get layers() {
        return {
            nodes: this.#nodesLayer,
            connections: this.#connectionsLayer,
        };
    }

    get trigger(): TriggerData | null {
        return this.#triggers[this.#trigger ?? ""] ?? null;
    }

    get triggersList(): { name: string; id: string }[] {
        return R.pipe(
            R.values(this.#triggers),
            R.flatMap(({ id, name }) => ({ id, name }))
        );
    }

    serializeTriggers(): TriggerRawData[] {
        return R.pipe(R.values(this.#triggers), R.map(serializeTrigger));
    }

    saveTrigger(): Promise<TriggerRawData[]> {
        return setSetting("triggers", this.serializeTriggers());
    }

    addTriggers(triggers: TriggerData[]) {
        for (const trigger of triggers) {
            this.#triggers[trigger.id] = trigger;
        }
    }

    exportTriggers() {
        const serialized = R.pipe(
            R.values(this.#triggers),
            R.map((trigger) => {
                const serialized = serializeTrigger(trigger);
                delete serialized.id;
                return serialized;
            })
        );

        const stringified = JSON.stringify(serialized);

        game.clipboard.copyPlainText(stringified);
        info("export-all.confirm");
    }

    exportTrigger(id: string) {
        const trigger = this.getTrigger(id);
        if (!trigger) return;

        const serialized = serializeTrigger(trigger);
        delete serialized.id;

        const stringified = `[${JSON.stringify(serialized)}]`;

        game.clipboard.copyPlainText(stringified);
        info("export-trigger.confirm", { name: trigger.name });
    }

    destroy(removeView?: boolean, stageOptions?: PIXI.IDestroyOptions | boolean) {
        this.stage.removeAllListeners();

        //@ts-expect-error
        this.#triggers = null;
        this.#trigger = null;
        //@ts-expect-error
        this.#hitArea = null;
        //@ts-expect-error
        this.#gridLayer = null;
        //@ts-expect-error
        this.#nodesLayer = null;
        //@ts-expect-error
        this.#connectionsLayer = null;
        this.#drag = null;

        super.destroy(true, true);
    }

    getLocalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x - viewBounds.x, y: point.y - viewBounds.y };
    }

    getGlobalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x + viewBounds.x, y: point.y + viewBounds.y };
    }

    getTrigger(id: string): TriggerData | undefined {
        return this.#triggers[id];
    }

    setTrigger(triggerOrId: Maybe<string | TriggerData>) {
        const trigger = R.isPlainObject(triggerOrId)
            ? triggerOrId
            : this.#triggers[triggerOrId ?? ""];

        if (this.trigger?.id !== trigger?.id) {
            this.#reset();

            this.#trigger = trigger?.id ?? null;

            if (trigger) {
                this.#initialize();
            }
        }

        this.#resetPosition();
    }

    createTrigger({ name, event }: { event: EventNodeKey; name: string }) {
        const data: TriggerRawData = {
            id: fu.randomID(),
            name,
            nodes: [
                {
                    id: fu.randomID(),
                    type: "event",
                    key: event,
                    x: 100,
                    y: 200,
                },
            ],
        };

        const trigger = processTriggerData(data);
        if (!trigger) return;

        this.#triggers[trigger.id] = trigger;
        this.setTrigger(trigger);
    }

    editTrigger(id: string, { name }: { name: string }) {
        const trigger = this.#triggers[id];
        if (!trigger) return;

        trigger.name = name;
    }

    deleteTrigger(id: string) {
        const trigger = this.#triggers[id];
        if (!trigger) return;

        if (this.#trigger === id) {
            this.setTrigger(null);
        }

        delete this.#triggers[id];
    }

    async createNode(
        type: NodeType,
        key: string,
        x: number,
        y: number,
        id: string = fu.randomID()
    ): Promise<BlueprintNode | undefined> {
        const trigger = this.trigger;
        if (!trigger) return;

        const dataRaw: NodeRawData = { id, type, key, x, y };

        if (type === "variable") {
            const [nodeId, variableKey, variableType] = key.split(".");

            dataRaw.key = "variable";

            dataRaw.inputs = {
                id: { value: nodeId },
                key: { value: variableKey },
                type: { value: variableType },
            };
        }

        const data = processNodeData(dataRaw);
        if (!data) return;

        trigger.nodes[data.id] = data;
        return this.#nodesLayer.addNode(data);
    }

    deleteNode(id: string) {
        const node = this.#nodesLayer.getNode(id);
        if (!node) return;

        for (const entry of node.entries()) {
            entry.removeConnections();
        }

        this.#nodesLayer.removeNode(id);

        delete this.trigger?.nodes[id];

        if (node.hasVariables) {
            const skipThis = node.type === "event";

            for (const otherNode of this.#nodesLayer.nodes()) {
                if (
                    otherNode instanceof VariableBlueprintNode &&
                    otherNode.nodeId === id &&
                    (!skipThis || otherNode.variableKey !== "this")
                ) {
                    this.deleteNode(otherNode.id);
                }
            }
        }
    }

    convertTrigger(event: EventNodeKey) {
        const newSchema = getSchema({ type: "event", key: event });
        const previousEvent = this.#nodesLayer.getNode(this.trigger?.event.id ?? "");
        if (!previousEvent || !newSchema) return;

        const previsouId = previousEvent.id;
        const uniques = R.isArray(newSchema.unique) ? newSchema.unique : [];

        for (const otherNode of this.#nodesLayer.nodes()) {
            if (
                uniques.includes(otherNode.key) ||
                (otherNode instanceof VariableBlueprintNode &&
                    otherNode.nodeId === previsouId &&
                    otherNode.variableKey !== "this")
            ) {
                this.deleteNode(otherNode.id);
            }
        }

        this.deleteNode(previsouId);
        this.createNode("event", event, 100, 200, previsouId);
    }

    #initialize() {
        this.stage.on("pointerdown", this.#onPointerDown, this);

        this.#nodesLayer.initialize();
        this.#connectionsLayer.initialize();
    }

    #reset() {
        this.#trigger = null;

        this.stage.removeAllListeners();

        this.#nodesLayer.reset();
        this.#connectionsLayer.reset();
    }

    #resetPosition() {
        const distance = distanceBetweenPoints(this.stage.position, { x: 0, y: 0 });
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

    #sortLayers() {
        this.#gridLayer.zIndex = 0;
        this.#connectionsLayer.zIndex = 1;
        this.#nodesLayer.zIndex = 2;

        this.stage.sortChildren();
    }

    #onDropCanvasData(event: DragEvent) {
        const data = TextEditor.getDragEventData(event) as unknown as DropCanvasData;

        if (
            !R.isPlainObject(data) ||
            !["Item", "Macro"].includes(data.type ?? "") ||
            !R.isString(data.uuid)
        )
            return;

        const document = fromUuidSync<ClientDocument | CompendiumIndexData>(data.uuid);
        if (document) {
            this.#onDropDocument(event, document);
        }
    }

    #onDropDocument(event: DragEvent, document: ClientDocument | CompendiumIndexData) {
        const localPoint = this.getLocalCoordinates(event);

        for (const node of this.#nodesLayer.nodes()) {
            const dropped = node.onDropDocument(localPoint, document);
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
            const target = subtractPoints(event.global, this.stage.position);
            const distance = distanceBetweenPoints(target, origin);

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

        if (!wasDragging && this.trigger) {
            this.#onMenu(event.global);
        }
    }

    async #onMenu({ x, y }: Point) {
        const result = await BlueprintNodesMenu.open(this, { x, y });
        if (!result) return;

        const { key, type } = result;
        const node = await this.createNode(type, key, x, y);
        if (!node) return;

        const center = {
            x: x - node.width / 2,
            y: y - node.height / 2,
        };

        const point = subtractPoints(center, this.stage.position);
        node.setPosition(point);
    }
}

export { Blueprint };
