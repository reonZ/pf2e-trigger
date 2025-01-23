import { BlueprintNodesMenu } from "blueprint/menu/blueprint-nodes-menu";
import { BlueprintNode } from "blueprint/node/blueprint-node";
import { BlueprintEntry } from "blueprint/node/entry/blueprint-entry";
import { NodeEntryId } from "data/data-entry";
import { subtractPoints } from "module-helpers";
import { BlueprintLayer } from "./layer";
import { BlueprintNodesLayer } from "./layer-nodes";

class BlueprintConnectionsLayer extends BlueprintLayer<PIXI.Graphics> {
    #connector!: PIXI.Graphics;
    #connecting: BlueprintEntry | null = null;
    #connections: Map<TwoWaysId, PIXI.Graphics> = new Map();

    get nodesLayer(): BlueprintNodesLayer {
        return this.blueprint.layers.nodes;
    }

    initialize(): void {
        const trigger = this.trigger;
        if (!trigger) return;

        this.#connector = this.addChild(new PIXI.Graphics());

        for (const node of this.nodesLayer.nodes()) {
            for (const origin of node.entries("outputs", true)) {
                for (const id of origin.connections) {
                    const target = this.nodesLayer.getEntryFromId(id);
                    if (!target) continue;
                    this.createConnection(origin, target);
                }
            }
        }
    }

    reset(): void {
        super.reset();

        this.#connecting = null;
        this.#connections.clear();
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

    updateConnections(nodeOrId: BlueprintNode | string) {
        const node =
            nodeOrId instanceof BlueprintNode ? nodeOrId : this.nodesLayer.getNode(nodeOrId);
        if (!node) return;

        for (const origin of node.entries(undefined, true)) {
            for (const id of origin.connections) {
                const target = this.nodesLayer.getEntryFromId(id);
                if (!target || !target.connections.includes(origin.id)) continue;

                const connection = this.#connections.get(`${origin.id}-${target.id}`);
                if (!connection) continue;

                this.#drawConnection(connection, origin, target);
            }
        }
    }

    startConnection(origin: BlueprintEntry) {
        this.#connector.clear();

        this.nodesLayer.interactiveChildren = false;

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

        for (const other of this.nodesLayer.nodes()) {
            const target = other.onConnect(point, origin);
            if (target === undefined) continue;

            if (target) {
                this.#connector.clear();
                this.#onConnected(origin, target);
            } else if (target === null) {
                this.#connector.clear();
            }

            return;
        }

        await this.#onMenu(origin, point);
        this.#connector.clear();
    }

    async #onMenu(origin: BlueprintEntry, { x, y }: Point) {
        if (!this.trigger) return;

        const result = await BlueprintNodesMenu.open(this.blueprint, { x, y }, origin);
        if (!result) return;

        const { key, type } = result;
        const node = await this.blueprint.createNode(type, key, x, y);
        if (!node) return;

        const target = node.getEntryFromType(origin.oppositeCategory, origin.type);
        if (!target) return;

        const offset = subtractPoints({ x, y }, target.connectorOffset);
        const point = subtractPoints(offset, this.stage.position);

        node.setPosition(point);
        this.#onConnected(origin, target);
    }

    #onConnected(origin: BlueprintEntry, target: BlueprintEntry) {
        origin.addConnection(target.id);
        target.addConnection(origin.id);

        this.createConnection(origin, target);
    }

    #terminateConnection(event: PIXI.FederatedPointerEvent) {
        this.#connecting = null;

        this.nodesLayer.interactiveChildren = true;

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

export { BlueprintConnectionsLayer };
export type { TwoWaysId };
