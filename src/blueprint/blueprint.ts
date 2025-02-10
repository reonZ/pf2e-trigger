import { segmentEntryId } from "data/data-entry";
import { processNodeData } from "data/data-node";
import { createTriggerData, serializeTrigger } from "data/data-trigger";
import { getTriggersDataMap } from "data/data-trigger-list";
import { MODULE, R, distanceBetweenPoints, setSetting, subtractPoints } from "module-helpers";
import { getSchema } from "schema/schema-list";
import { BlueprintNodeConnections } from "./blueprint-connections";
import { BlueprintEntry } from "./entry/blueprint-entry";
import { BlueprintNodesMenu } from "./menu/blueprint-menu-nodes";
import { BlueprintNode } from "./node/blueprint-node";
import { createBlueprintNode } from "./node/blueprint-node-list";
import { VariableBlueprintNode } from "./node/variable/blueprint-variable";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #initialized: boolean = false;
    #gridLayer: PIXI.TilingSprite;
    #nodesLayer: PIXI.Container;
    #connectionsLayer: BlueprintNodeConnections;
    #hitArea: PIXI.Rectangle = new PIXI.Rectangle();
    #parent: foundry.applications.api.ApplicationV2;
    #nodes: Collection<BlueprintNode> = new Collection();
    #triggers: Record<string, TriggerData>;
    #trigger: string | null = null;
    #drag: { origin: Point; dragging?: boolean } | null = null;

    constructor(parent: foundry.applications.api.ApplicationV2) {
        super({
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        this.#parent = parent;
        this.#triggers = getTriggersDataMap();

        this.#gridLayer = this.#drawGrid();
        this.#connectionsLayer = new BlueprintNodeConnections(this);
        this.#nodesLayer = this.stage.addChild(new PIXI.Container());

        this.stage.hitArea = this.#hitArea;
        this.stage.eventMode = "static";

        this.view.addEventListener("drop", this.#onDropCanvasData.bind(this));

        MODULE.debug(this);
    }

    get gridSize(): number {
        return 16;
    }

    get parent(): HTMLElement {
        return this.#parent.element;
    }

    get trigger(): TriggerData | null {
        return this.#triggers[this.#trigger ?? ""] ?? null;
    }

    get subtriggers(): TriggerData[] {
        return R.pipe(
            R.values(this.#triggers),
            R.filter((trigger) => trigger.event.type === "subtrigger")
        );
    }

    get triggersList(): ListedTrigger[] {
        return R.pipe(
            R.values(this.#triggers),
            R.flatMap(({ id, name, disabled, event }) => ({
                id,
                name,
                enabled: !disabled,
                sub: event.type === "subtrigger",
            }))
        );
    }

    get nodes(): Generator<BlueprintNode, void, undefined> {
        return this.nodesGenerator();
    }

    get triggers(): TriggerData[] {
        return R.values(this.#triggers);
    }

    get connections(): BlueprintNodeConnections {
        return this.#connectionsLayer;
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
        //@ts-expect-error
        this.#parent = null;
        this.#nodes.clear();

        super.destroy(true, true);
    }

    initialize() {
        if (this.#initialized) return;

        this.#initialized = true;

        this.parent.prepend(this.view);

        this.resizeAll();
    }

    resizeAll() {
        const parent = this.parent;

        this.renderer.resize(parent.clientWidth, parent.clientHeight);

        this.#gridLayer.width = this.screen.width;
        this.#gridLayer.height = this.screen.height;

        this.#hitArea.width = this.screen.width;
        this.#hitArea.height = this.screen.height;
    }

    enableNodesInteraction(enabled: boolean) {
        this.#nodesLayer.interactiveChildren = enabled;
    }

    getLocalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x - viewBounds.x, y: point.y - viewBounds.y };
    }

    getGlobalCoordinates(point: Point) {
        const viewBounds = this.view.getBoundingClientRect();
        return { x: point.x + viewBounds.x, y: point.y + viewBounds.y };
    }

    *nodesGenerator(): Generator<BlueprintNode, void, undefined> {
        for (const node of this.#nodes) {
            yield node;
        }
    }

    addTriggers(triggers: TriggerData[]) {
        for (const trigger of triggers) {
            this.#triggers[trigger.id] = trigger;
        }
    }

    saveTriggers(): Promise<TriggerRawData[]> {
        return setSetting("triggers", this.serializeTriggers());
    }

    serializeTriggers(): TriggerRawData[] {
        return R.pipe(
            R.values(this.#triggers),
            R.map((trigger) => serializeTrigger(trigger))
        );
    }

    createTrigger({ name, event }: { event?: NodeEventKey; name: string }) {
        const trigger = createTriggerData(name, event);
        if (!trigger) return;

        this.#triggers[trigger.id] = trigger;
        this.setTrigger(trigger.id);
    }

    getTrigger(id: string): TriggerData | undefined {
        return this.#triggers[id];
    }

    setTrigger(id: Maybe<string>) {
        const trigger = this.#triggers[id ?? ""];

        if (this.trigger?.id !== trigger?.id) {
            this.#reset();

            this.#trigger = id ?? null;

            if (trigger) {
                this.#render();
            }
        }

        this.#resetPosition();
    }

    deleteTrigger(triggerId: string) {
        const trigger = this.#triggers[triggerId];
        if (!trigger) return;

        let refreshCurrent = false;

        if (trigger.isSub === true) {
            for (const otherTrigger of this.triggers) {
                if (otherTrigger.isSub) continue;

                if (otherTrigger.id === this.#trigger) {
                    refreshCurrent = true;
                }

                for (const node of R.values(otherTrigger.nodes)) {
                    if (node.subId !== triggerId) continue;

                    const entries = R.pipe(
                        ["inputs", "outputs"] as const,
                        R.flatMap((category) => {
                            return R.pipe(
                                R.entries(node[category]),
                                R.flatMap(([key, { ids = [] }]) =>
                                    ids.map((id) => [`${node.id}.${category}.${key}`, id] as const)
                                )
                            );
                        })
                    );

                    for (const [entryId, targetId] of entries) {
                        const { nodeId, category, key } = segmentEntryId(targetId);
                        otherTrigger.nodes[nodeId]?.[category][key]?.ids?.findSplice(
                            (x) => x === entryId
                        );
                    }

                    delete otherTrigger.nodes[node.id];
                }
            }
        }

        if (this.#trigger === triggerId) {
            this.setTrigger(null);
        } else if (refreshCurrent) {
            const id = this.#trigger;
            this.#reset();
            this.#trigger = id;
            this.#render();
        }

        delete this.#triggers[triggerId];
    }

    convertTrigger(event: NodeEventKey) {
        const trigger = this.trigger;
        if (!trigger) return;

        const newSchema = getSchema({ type: "event", key: event });
        const previousEvent = this.getNode(trigger.event.id ?? "");
        if (!previousEvent || !newSchema) return;

        const previsouId = previousEvent.id;
        const uniques = R.isArray(newSchema.unique) ? newSchema.unique : [];

        this.deleteNode(previsouId);
        this.createNode({ type: "event", key: event, id: previsouId });

        this.deleteVariables(previsouId, { skipThis: true });

        if (uniques.length) {
            for (const otherNode of this.nodes) {
                if (uniques.includes(otherNode.key)) {
                    this.deleteNode(otherNode.id);
                }
            }
        }

        trigger.event = this.trigger.nodes[previsouId];
    }

    getEntry(id: NodeEntryId): BlueprintEntry | undefined {
        return this.getNodeFromEntryId(id)?.getEntry(id);
    }

    getNodeFromEntryId(id: NodeEntryId): BlueprintNode | undefined {
        const { nodeId } = segmentEntryId(id);
        return this.getNode(nodeId);
    }

    getNode(id: string): BlueprintNode | undefined {
        return this.#nodes.get(id);
    }

    addNode(node: NodeData | BlueprintNode): BlueprintNode {
        const blueprintNode =
            node instanceof BlueprintNode ? node : createBlueprintNode(this, node);

        this.#nodes.set(node.id, blueprintNode);
        this.#nodesLayer.addChild(blueprintNode);

        return blueprintNode;
    }

    createNode(dataRaw: CreateNodeData): BlueprintNode | undefined {
        const trigger = this.trigger;
        if (!trigger) return;

        dataRaw.id ??= fu.randomID();
        dataRaw.x ??= 100;
        dataRaw.y ??= 200;

        if (dataRaw.type === "variable") {
            const variableKey = dataRaw.key as BlueprintMenuVariableKey;
            const [nodeId, category, entryKey, entryType, entryLabel] = R.split(variableKey, ".");

            dataRaw.key = "variable";

            dataRaw.inputs = {
                input: { ids: [`${nodeId}.${category}.${entryKey}`] },
            };

            dataRaw.custom = {
                inputs: [
                    {
                        type: entryType,
                        key: "input",
                    },
                ],
                outputs: [
                    {
                        type: entryType,
                        key: "output",
                        label: entryLabel,
                    },
                ],
            };
        } else if (dataRaw.type === "subtrigger") {
            dataRaw.subId = dataRaw.key;
            dataRaw.key = "subtrigger-node";
        }

        const data = processNodeData(dataRaw);
        if (!data) return;

        trigger.nodes[data.id] = data;
        return this.addNode(data);
    }

    deleteNode(id: string) {
        const node = this.getNode(id);
        if (!node) return;

        for (const entry of node.entries()) {
            entry.removeConnections(true);
        }

        node.eventMode = "none";

        this.#nodes.delete(node.id);

        if (this.#nodesLayer.removeChild(node)) {
            node.destroy();
        }

        this.deleteVariables(id, { skipThis: node.type === "event" });

        delete this.trigger?.nodes[id];
    }

    deleteVariables(
        nodeId: string,
        { skipThis, variableKey }: { skipThis?: boolean; variableKey?: string } = {}
    ) {
        for (const otherNode of this.nodes) {
            if (
                otherNode instanceof VariableBlueprintNode &&
                otherNode.nodeId === nodeId &&
                !(variableKey && otherNode.variableKey !== variableKey) &&
                !(skipThis && otherNode.variableKey === "this")
            ) {
                this.deleteNode(otherNode.id);
            }
        }
    }

    cloneNode(id: string) {
        const node = this.trigger?.nodes[id];
        if (!node) return;

        const clone = fu.deepClone(node);
        clone.id = fu.randomID();
        clone.inputs = R.mapValues(clone.inputs, (input) => {
            return "ids" in input ? {} : input;
        });
        clone.outputs = {};
        clone.x += 50;
        clone.y += 50;

        this.createNode(clone);
    }

    #render() {
        this.stage.on("pointerdown", this.#onPointerDown, this);

        for (const node of R.values(this.trigger?.nodes ?? {})) {
            this.addNode(node);
        }

        this.#connectionsLayer.initialize();
    }

    #reset() {
        this.#trigger = null;
        this.#nodes.clear();
        this.#connectionsLayer.reset();

        this.stage.removeAllListeners();

        for (const layer of [this.#nodesLayer, this.#connectionsLayer]) {
            layer.removeAllListeners();

            const removed = layer.removeChildren();

            for (let i = 0; i < removed.length; ++i) {
                removed[i].destroy(true);
            }
        }
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

    #drawGrid(): PIXI.TilingSprite {
        const gridSize = this.gridSize;
        const textureSize = gridSize * 10;

        const renderTexture = PIXI.RenderTexture.create({
            width: textureSize * devicePixelRatio,
            height: textureSize * devicePixelRatio,
            resolution: devicePixelRatio,
        });

        const gridLayer = new PIXI.TilingSprite(renderTexture);
        const grid = new PIXI.Graphics();

        for (let i = 0; i <= 10; i++) {
            const size = this.gridSize * i;
            const color = i === 0 || i === 10 ? 0x000000 : 0x808080;

            grid.lineStyle(1, color, 0.2, 1);

            grid.moveTo(0, size);
            grid.lineTo(textureSize, size);

            grid.moveTo(size, 0);
            grid.lineTo(size, textureSize);
        }

        this.renderer.render(grid, { renderTexture });

        return this.stage.addChild(gridLayer);
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
        if (!document) return;

        const localPoint = this.getLocalCoordinates(event);

        for (const node of this.nodes) {
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

        this.#gridLayer.position.set(-x, -y);
        this.#gridLayer.tilePosition.set(x, y);
    }

    async #onMenu({ x, y }: Point) {
        const result = await BlueprintNodesMenu.open(this, { x, y });
        if (!result) return;

        const { key, type } = result;
        const node = this.createNode({ type, key, x, y });
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
