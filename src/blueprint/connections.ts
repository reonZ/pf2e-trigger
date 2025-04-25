import { NodeEntryId, TriggerData } from "data";
import { R, subtractPoint } from "module-helpers";
import { getFilterGroups } from "schema";
import { Blueprint } from "./blueprint";
import { BlueprintMenu } from "./context-menu";
import { BlueprintEntry } from "./nodes";

class BlueprintConnectionsLayer extends PIXI.Container<PIXI.Graphics> {
    #blueprint: Blueprint;
    #connecting: BlueprintEntry | null = null;
    #connections: Map<TwoWaysId, PIXI.Graphics> = new Map();
    #connector: PIXI.Graphics | null = null;
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

    draw() {
        const trigger = this.trigger;
        if (this.#drawn || !trigger) return;
        this.#drawn = true;
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

    remove(origin: BlueprintEntry, target: BlueprintEntry) {
        // because of toWays, we want to be sure to only destroy it once
        let toRemove: PIXI.Graphics | undefined;

        twoWays(origin, target, (id) => {
            const connection = this.#connections.get(id);
            if (!connection) return;

            toRemove = connection;
            this.#connections.delete(id);
        });

        if (toRemove) {
            this.removeChild(toRemove);
            toRemove.destroy(true);
        }
    }

    #drawConnection(
        connection: PIXI.Graphics,
        origin: BlueprintEntry,
        target: Point | BlueprintEntry
    ) {
        const originCenter = subtractPoint(origin.connectorCenter, this.stage.position);
        const targetCenter = subtractPoint(
            target instanceof BlueprintEntry ? target.connectorCenter : target,
            this.stage.position
        );

        // TODO draw bi-color if needed

        connection.clear();
        connection.moveTo(originCenter.x, originCenter.y);
        connection.lineStyle(6, origin.connectorColor, 1, 0.5);
        connection.lineTo(targetCenter.x, targetCenter.y);
    }

    #addConnection(origin: BlueprintEntry, target: BlueprintEntry) {
        const connection = this.addChild(new PIXI.Graphics());

        origin.addConnection(target);
        target.addConnection(origin);

        origin.refreshConnector();
        target.refreshConnector();

        this.#drawConnection(connection, origin, target);
        twoWays(origin.id, target.id, (id) => this.#connections.set(id, connection));
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

        for (const otherNode of this.blueprint.nodesLayer.nodes()) {
            const otherEntry = otherNode.testConnection(point, entry);
            if (otherEntry === undefined) continue;

            if (otherEntry) {
                this.#addConnection(entry, otherEntry);
            }

            return this.connector.clear();
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

    async #onMenu(entry: BlueprintEntry, { x, y }: Point) {
        if (!this.trigger) return;

        const entryType = entry.type;
        const oppositeCategory = entry.oppositeCategory;
        const groups = R.pipe(
            getFilterGroups(),
            R.map(({ entries, title, isSub }) => {
                const filtered = entries.filter((filter) =>
                    filter[oppositeCategory].includes(entryType)
                );
                if (!filtered.length) return;

                return {
                    title,
                    isSub,
                    entries: filtered,
                };
            }),
            R.filter(R.isTruthy)
        );

        const result = await BlueprintMenu.waitNodes(this.blueprint, groups, x, y);
        if (!result) return;

        const { key, type } = result;
        const node = await this.blueprint.createNode({ type, key, position: { x, y } });
        if (!node) return;

        const otherEntry = Array.from(node.entries(entry.oppositeCategory)).find((other) =>
            other.isCompatibleWith(entry)
        );
        if (!otherEntry) return;

        const offset = subtractPoint({ x, y }, otherEntry.connectorOffset);
        const point = subtractPoint(offset, this.stage.position);

        node.setPosition(point);
        this.#addConnection(entry, otherEntry);
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

type TwoWaysId = `${NodeEntryId}-${NodeEntryId}`;

export { BlueprintConnectionsLayer };
