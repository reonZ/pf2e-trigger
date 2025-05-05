import { NodeEntryId, TriggerData } from "data";
import { calculateMidPoint, subtractPoint } from "module-helpers";
import { Blueprint } from "./blueprint";
import { BlueprintEntry, BlueprintNode } from "./nodes";

class BlueprintConnectionsLayer extends PIXI.Container<PIXI.Graphics> {
    #blueprint: Blueprint;
    #connecting: BlueprintEntry | null = null;
    #connections: Map<TwoWaysId, PIXI.Graphics> = new Map();
    #connector: NodeConnection | null = null;
    #drawn: boolean = false;

    constructor(blueprint: Blueprint) {
        super();

        this.#blueprint = blueprint;
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get trigger(): TriggerData | undefined {
        return this.blueprint.trigger;
    }

    get connector(): PIXI.Graphics {
        return (this.#connector ??= this.addChild(new PIXI.Graphics()));
    }

    get nodes(): Generator<BlueprintNode, void, undefined> {
        return this.blueprint.nodesLayer.nodes();
    }

    draw() {
        const trigger = this.trigger;
        if (this.#drawn || !trigger) return;
        this.#drawn = true;

        for (const node of this.nodes) {
            for (const origin of node.entries("outputs")) {
                for (const id of origin.connections) {
                    const target = this.blueprint.getEntry(id);
                    if (!target) continue;

                    const connection = this.addChild(new PIXI.Graphics());

                    this.#drawConnection(connection, origin, target);
                    twoWays(origin.id, target.id, (id) => this.#connections.set(id, connection));
                }
            }
        }
    }

    clear() {
        this.removeAllListeners();

        this.#drawn = false;
        this.#connector = null;
        this.#connecting = null;
        this.#connections.clear();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }

    start(origin: BlueprintEntry) {
        this.connector.clear();

        this.blueprint.enableNodesInteraction(false);

        this.#connecting = origin;

        this.stage.on("pointermove", this.#dragConnection, this);
        this.stage.on("pointerup", this.#endConnection, this);
        this.stage.on("pointerupoutside", this.#terminateConnection, this);
    }

    update(origin: BlueprintEntry, target: BlueprintEntry) {
        const connection = this.#connections.get(`${origin.id}-${target.id}`);

        if (connection) {
            this.#drawConnection(connection, origin, target);
        }
    }

    #drawConnection(
        connection: NodeConnection,
        origin: BlueprintEntry,
        target: Point | BlueprintEntry
    ) {
        const targetIsEntry = target instanceof BlueprintEntry;
        const originType = origin.type;
        const targetType = targetIsEntry ? target.type : originType;
        const originCenter = subtractPoint(origin.connectorCenter, this.stage.position);
        const targetCenter = subtractPoint(
            targetIsEntry ? target.connectorCenter : target,
            this.stage.position
        );

        connection.clear();
        connection.moveTo(originCenter.x, originCenter.y);
        connection.lineStyle(6, origin.connectorColor, 1, 0.5);

        if (!targetIsEntry || originType === targetType) {
            connection.lineTo(targetCenter.x, targetCenter.y);
            return;
        }

        const halfPoint = calculateMidPoint(originCenter, targetCenter);

        connection.lineTo(halfPoint.x, halfPoint.y);
        connection.lineStyle(6, target.connectorColor, 1, 0.5);
        connection.lineTo(targetCenter.x, targetCenter.y);

        const converter = (connection.converter ??= (() => {
            const padding = { x: 4, y: 2 };
            const converter = new PIXI.Graphics();
            const icon = origin.node.fontAwesomeIcon("\uf0ec");

            const width = icon.width + padding.x * 2;
            const height = icon.height + padding.y * 2;

            icon.position.set(padding.x, padding.y);

            converter.beginFill(0x0, 0.5);
            converter.lineStyle({ color: 0x0, width: 2, alpha: 0.8 });
            converter.drawRoundedRect(0, 0, width, height, 4);
            converter.endFill();

            converter.addChild(icon);

            return converter;
        })());

        converter.position.set(
            halfPoint.x - converter.width / 2,
            halfPoint.y - converter.height / 2
        );

        converter.rotation;

        connection.addChild(converter);
    }

    #dragConnection(event: PIXI.FederatedPointerEvent) {
        if (!this.#connecting) return;

        event.stopPropagation();
        this.#drawConnection(this.connector, this.#connecting, event.global);
    }

    async #endConnection(event: PIXI.FederatedPointerEvent) {
        const entry = this.#connecting;

        this.#terminateConnection(event);

        if (!entry) return;

        const point = event.global;

        for (const otherNode of this.nodes) {
            const otherEntry = otherNode.testConnection(point, entry);
            if (otherEntry === undefined) continue;

            if (otherEntry) {
                this.#addConnection(entry, otherEntry);
            }

            return this.blueprint.refresh();
        }

        await this.#onMenu(entry, point);
        this.connector.clear();
    }

    #terminateConnection(event: PIXI.FederatedPointerEvent) {
        this.#connecting = null;

        this.stage.off("pointermove", this.#dragConnection, this);
        this.stage.off("pointerup", this.#endConnection, this);
        this.stage.off("pointerupoutside", this.#terminateConnection, this);

        this.blueprint.enableNodesInteraction(true);
    }

    #addConnection(origin: BlueprintEntry, target: BlueprintEntry) {
        origin.node.data.addConnection(origin.id, target.id);
        target.node.data.addConnection(target.id, origin.id);
    }

    async #onMenu(entry: BlueprintEntry, { x, y }: Point) {
        if (!this.trigger) return;

        const node = await this.blueprint.createNodeFromFilter({ x, y }, entry);
        if (!node) return;

        const otherEntry = Array.from(node.entries(entry.oppositeCategory)).find((other) =>
            other.isCompatibleWith(entry)
        );
        if (!otherEntry) return;

        const offset = subtractPoint({ x, y }, otherEntry.connectorOffset);
        const point = subtractPoint(offset, this.stage.position);

        node.setPosition(point);
        this.#addConnection(entry, otherEntry);

        this.blueprint.refresh();
    }
}

function twoWays(
    a: NodeEntryId | BlueprintEntry,
    b: NodeEntryId | BlueprintEntry,
    callback: (id: TwoWaysId) => void
) {
    a = a instanceof BlueprintEntry ? a.id : a;
    b = b instanceof BlueprintEntry ? b.id : b;

    for (const id of [`${a}-${b}`, `${b}-${a}`] as const) {
        callback(id);
    }
}

type NodeConnection = PIXI.Graphics & { converter?: PIXI.Graphics };

type TwoWaysId = `${NodeEntryId}-${NodeEntryId}`;

export { BlueprintConnectionsLayer };
