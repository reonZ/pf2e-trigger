import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { haveCompatibleEntryType, haveSameEntryType } from "data/data-entry";
import { calculateMidPoint, subtractPoints } from "module-helpers";
import { Blueprint } from "./blueprint";
import { BlueprintNodesMenu } from "./menu/blueprint-menu-nodes";
import { BlueprintNode } from "./node/blueprint-node";

class BlueprintNodeConnections extends PIXI.Container<PIXI.Graphics> {
    #blueprint: Blueprint;
    #connector: PIXI.Graphics;
    #connecting: BlueprintEntry | null = null;
    #connections: Map<TwoWaysId, PIXI.Graphics> = new Map();

    constructor(blueprint: Blueprint) {
        super();

        this.#blueprint = blueprint;
        this.#connector = this.addChild(new PIXI.Graphics());

        blueprint.stage.addChild(this);
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): TriggerData | null {
        return this.blueprint.trigger;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    initialize() {
        if (!this.trigger) return;

        this.#connector = this.addChild(new PIXI.Graphics());

        for (const node of this.blueprint.nodes) {
            for (const origin of node.entries("outputs")) {
                for (const id of origin.connections) {
                    const target = this.blueprint.getEntry(id);
                    if (!target) continue;
                    this.connectEntries(origin, target);
                }
            }
        }
    }

    reset() {
        this.#connecting = null;
        this.#connections.clear();
    }

    connectEntries(origin: BlueprintEntry, target: BlueprintEntry) {
        const connection = this.addChild(new PIXI.Graphics());

        this.#drawConnection(connection, origin, target);

        twoWays(origin.id, target.id, (id) => this.#connections.set(id, connection));
    }

    createConnection(origin: BlueprintEntry, target: BlueprintEntry) {
        const connection = this.addChild(new PIXI.Graphics());

        this.#drawConnection(connection, origin, target);

        twoWays(origin.id, target.id, (id) => this.#connections.set(id, connection));
    }

    removeConnection(originId: NodeEntryId, targetId: NodeEntryId) {
        let toRemove: PIXI.Graphics | undefined;

        twoWays(originId, targetId, (id) => {
            const connection = this.#connections.get(id);
            if (!connection) return;

            toRemove = connection;
            this.#connections.delete(id);
        });

        if (toRemove) {
            this.removeChild(toRemove);
            toRemove.destroy();
        }
    }

    updateNodeConnections(node: BlueprintNode) {
        for (const origin of node.entries(undefined)) {
            for (const id of origin.connections) {
                const target = this.blueprint.getEntry(id);
                if (!target || !target.connections.includes(origin.id)) continue;

                const connection = this.#connections.get(`${origin.id}-${target.id}`);
                if (!connection) continue;

                this.#drawConnection(connection, origin, target);
            }
        }
    }

    startConnection(origin: BlueprintEntry) {
        this.#connector.clear();

        this.blueprint.enableNodesInteraction(false);

        this.#connecting = origin;

        this.stage.on("pointermove", this.#dragConnection, this);
        this.stage.on("pointerup", this.#endConnection, this);
        this.stage.on("pointerupoutside", this.#terminateConnection, this);
    }

    #drawConnection(
        connection: PIXI.Graphics,
        origin: Point | BlueprintEntry,
        target: Point | BlueprintEntry,
        color?: PIXI.ColorSource
    ) {
        const originIsConnector = origin instanceof BlueprintEntry;
        const targetIsConnector = target instanceof BlueprintEntry;
        const originCenter = subtractPoints(
            originIsConnector ? origin.connectorCenter : origin,
            this.stage.position
        );
        const targetCenter = subtractPoints(
            targetIsConnector ? target.connectorCenter : target,
            this.stage.position
        );

        color ??= originIsConnector
            ? origin.connectorColor
            : targetIsConnector
            ? target.connectorColor
            : 0xffffff;

        connection.clear();
        connection.moveTo(originCenter.x, originCenter.y);
        connection.lineStyle(6, color, 1, 0.5);
        connection.lineTo(targetCenter.x, targetCenter.y);
    }

    #dragConnection(event: PIXI.FederatedPointerEvent) {
        if (!this.#connecting) return;

        event.stopPropagation();

        this.#drawConnection(
            this.#connector,
            this.#connecting,
            event.global,
            this.#connecting.connectorColor
        );
    }

    async #endConnection(event: PIXI.FederatedPointerEvent) {
        const origin = this.#connecting;

        this.#terminateConnection(event);

        if (!origin) return;

        const point = event.global;

        for (const other of this.blueprint.nodes) {
            const target = other.onConnect(point, origin);
            if (target === undefined) continue;

            if (target) {
                this.#connector.clear();
                this.#connectToEntry(origin, target);
            } else if (target === null) {
                this.#connector.clear();
            }

            return;
        }

        await this.#onMenu(origin, point);
        this.#connector.clear();
    }

    #connectToEntry(origin: BlueprintEntry, target: BlueprintEntry) {
        if (target.type === origin.type) {
            return this.#onConnected(origin, target);
        }

        const originPoint = origin.connectorCenter;
        const endPoint = target.connectorCenter;
        const midPoint = calculateMidPoint(originPoint, endPoint);

        const converter = this.blueprint.createNode({
            type: "converter",
            key: "item-converter",
            x: midPoint.x,
            y: midPoint.y,
        });

        if (!converter) return;

        converter.x = converter.x - converter.width / 2;
        converter.y = converter.y - converter.height / 2;

        const converterOrigin = Array.from(converter.entries(origin.oppositeCategory)).find(
            (entry) => haveSameEntryType(entry, origin)
        );
        const converterTarget = Array.from(converter.entries(target.oppositeCategory)).find(
            (entry) => haveSameEntryType(entry, target)
        );

        if (converterOrigin) {
            this.#onConnected(origin, converterOrigin);
        }

        if (converterTarget) {
            this.#onConnected(target, converterTarget);
        }
    }

    #connectTargetNode(origin: BlueprintEntry, node: BlueprintNode, x: number, y: number) {
        const target = Array.from(node.entries(origin.oppositeCategory)).find((entry) =>
            haveCompatibleEntryType(entry, origin)
        );
        if (!target) return;

        const offset = subtractPoints({ x, y }, target.connectorOffset);
        const point = subtractPoints(offset, this.stage.position);

        node.setPosition(point);
        this.#connectToEntry(origin, target);
    }

    #onConnected(origin: BlueprintEntry, target: BlueprintEntry) {
        origin.addConnection(target.id);
        target.addConnection(origin.id);

        origin.refreshConnector();
        target.refreshConnector();

        this.createConnection(origin, target);
    }

    async #onMenu(origin: BlueprintEntry, { x, y }: Point) {
        if (!this.trigger) return;

        const result = await BlueprintNodesMenu.open(this.blueprint, { x, y }, origin);
        if (!result) return;

        const { key, type } = result;
        const node = this.blueprint.createNode({ type, key, x, y });
        if (!node) return;

        this.#connectTargetNode(origin, node, x, y);
    }

    #terminateConnection(event: PIXI.FederatedPointerEvent) {
        this.#connecting = null;

        this.blueprint.enableNodesInteraction(true);

        this.stage.off("pointermove", this.#dragConnection, this);
        this.stage.off("pointerup", this.#endConnection, this);
        this.stage.off("pointerupoutside", this.#terminateConnection, this);
    }
}

function twoWays(a: NodeEntryId, b: NodeEntryId, callback: (id: TwoWaysId) => void) {
    for (const id of [`${a}-${b}`, `${b}-${a}`] as const) {
        callback(id);
    }
}

type TwoWaysId = `${NodeEntryId}-${NodeEntryId}`;

export { BlueprintNodeConnections };
