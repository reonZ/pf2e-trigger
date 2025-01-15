import { NodeEntryCategory, NodeType } from "@schema/schema";
import { BlueprintEntry } from "./blueprint-entry";
import { ItemPF2e } from "module-helpers";

const BRIDGE_CONNECTIONS: Record<NodeEntryCategory, NodeConnectionsList> = {
    inputs: {
        action: ["condition", "action"],
        condition: ["event", "condition"],
        event: [],
        // logic: [],
        value: [],
    },
    outputs: {
        action: ["action"],
        condition: ["condition", "action"],
        event: ["condition"],
        // logic: [],
        value: [],
    },
};

class BlueprintBridgeEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintEntry<TCategory> {
    get canConnect(): boolean {
        return this.category === "inputs" || !this.isActive;
    }

    get isActive(): boolean {
        return this.connections.length > 0;
    }

    get isValue(): boolean {
        return false;
    }

    onDropItem(point: Point, item: ItemPF2e | CompendiumIndexData): boolean {
        return false;
    }

    canConnectoToBridge(other: NodeType): boolean {
        const allowed = BRIDGE_CONNECTIONS[this.category][this.node.type];
        return allowed.includes(other);
    }

    canConnectTo(other: BlueprintEntry): boolean {
        return super.canConnectTo(other) && this.canConnectoToBridge(other.node.type);
    }

    protected _fillConnector(connector: PIXI.Graphics) {
        connector.lineStyle({ color: this.connectorColor, width: 1 });
        connector.moveTo(0, 0);
        connector.lineTo(6, 0);
        connector.lineTo(12, 6);
        connector.lineTo(6, 12);
        connector.lineTo(0, 12);
        connector.lineTo(0, 0);
    }
}

type NodeConnectionsList = Record<NodeType, NodeType[]>;

export { BlueprintBridgeEntry };
