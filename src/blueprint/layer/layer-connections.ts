import { BlueprintNode } from "@blueprint/node/blueprint-node";
import { BlueprintNodeEntry } from "@blueprint/node/node-entry";
import { NodeEntryId } from "@node/trigger-node";
import { createTriggerNode } from "@node/trigger-nodes-list";
import { R, subtractPoints } from "module-helpers";
import { BlueprintLayer } from "./layer";
import { BlueprintNodesLayer } from "./layer-nodes";
import { BlueprintNodesMenu } from "@blueprint/nodes-menu";

class BlueprintConnectionsLayer extends BlueprintLayer<PIXI.Graphics> {
    #connector!: PIXI.Graphics;
    #connecting: BlueprintNodeEntry | null = null;
    #connections: Map<TwoWaysId, PIXI.Graphics> = new Map();

    get nodes(): BlueprintNodesLayer {
        return this.blueprint.layers.nodes;
    }

    initialize(): void {
        const trigger = this.trigger;
        if (!trigger) return;

        for (const node of this.nodes.nodes()) {
            for (const origin of node.entries("outputs", true)) {
                const ids = origin.entries;

                for (const id of R.keys(ids)) {
                    const target = this.nodes.getEntryFromId(id);
                    if (!target || !target.entries[origin.id]) continue;

                    this.createConnection(origin, target);
                }
            }
        }
    }

    createConnection(origin: BlueprintNodeEntry, target: BlueprintNodeEntry) {
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
        const node = nodeOrId instanceof BlueprintNode ? nodeOrId : this.nodes.getNode(nodeOrId);
        if (!node) return;

        for (const origin of node.entries(undefined, true)) {
            const ids = origin.entries;

            for (const id of R.keys(ids)) {
                const target = this.nodes.getEntryFromId(id);
                if (!target || !target.entries[origin.id]) continue;

                const connection = this.#connections.get(`${origin.id}-${target.id}`);
                if (!connection) continue;

                this.#drawConnection(connection, origin, target);
            }
        }
    }

    startConnection(origin: BlueprintNodeEntry) {
        this.#connector ??= this.addChild(new PIXI.Graphics());
        this.#connector.clear();

        this.nodes.interactiveChildren = false;

        this.#connecting = origin;

        this.stage.on("pointermove", this.#dragConnection, this);
        this.stage.on("pointerup", this.#endConnection, this);
        this.stage.on("pointerupoutside", this.#terminateConnection, this);
    }

    #drawConnection(
        connection: PIXI.Graphics,
        origin: Point | BlueprintNodeEntry,
        target: Point | BlueprintNodeEntry,
        color?: PIXI.ColorSource
    ) {
        const originIsConnector = origin instanceof BlueprintNodeEntry;
        const targetIsConnector = target instanceof BlueprintNodeEntry;
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
        const target = this.nodes.onConnect(point, origin);

        if (target) {
            this.#connector.clear();
            this.#onConnected(origin, target);
        } else if (target === null) {
            this.#connector.clear();
        } else {
            await this.#onMenu(origin, point);
            this.#connector.clear();
        }
    }

    async #onMenu(origin: BlueprintNodeEntry, { x, y }: Point) {
        if (!this.trigger) return;

        const result = await BlueprintNodesMenu.open(this.blueprint, { x, y }, origin);
        if (!result) return;

        const node = createTriggerNode({ ...result, x, y, id: fu.randomID() });
        if (!node) return;

        this.trigger.addNode(node);

        const blueprintNode = this.nodes.addNode(node);
        const target = blueprintNode.getEntryFromType(origin.oppositeCategory, origin.type);

        if (target) {
            const offset = subtractPoints({ x, y }, target.connectorOffset);
            const point = subtractPoints(offset, this.stage.position);

            blueprintNode.setPosition(point);

            this.#onConnected(origin, target);
        }

        this.#connector.clear();
    }

    #onConnected(origin: BlueprintNodeEntry, target: BlueprintNodeEntry) {
        origin.trigger.addConnection(origin.category, origin.key, target.id);
        target.trigger.addConnection(target.category, target.key, origin.id);

        origin.refreshConnector();
        target.refreshConnector();

        this.createConnection(origin, target);
    }

    #terminateConnection(event: PIXI.FederatedPointerEvent) {
        this.#connecting = null;

        this.nodes.interactiveChildren = true;

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
