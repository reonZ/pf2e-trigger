import { isCustomNodeType } from "data/data-node";
import { BlueprintEntry } from "./blueprint-entry";

const FREE_BRIDGES: NodeType[] = ["logic", "splitter"];

const BRIDGE_CONNECTIONS: Record<NodeEntryCategory, NodeConnectionsList> = {
    inputs: {
        action: ["event", "condition", "action", "logic"],
        condition: ["event", "condition"],
        converter: [],
        event: [],
        logic: [],
        macro: [],
        splitter: [],
        subtrigger: [],
        value: [],
        variable: [],
    },
    outputs: {
        action: ["action"],
        condition: ["condition", "action"],
        converter: [],
        event: ["condition", "action"],
        logic: ["action"],
        macro: [],
        splitter: [],
        subtrigger: [],
        value: [],
        variable: [],
    },
};

class BlueprintBridgeEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintEntry<TCategory> {
    get canConnect(): boolean {
        return !this.isActive;
    }

    onDropDocument(point: Point, document: ClientDocument | CompendiumIndexData): boolean {
        return false;
    }

    canConnectoToBridge(other: NodeType): boolean {
        return (
            isFreeBridge(other) ||
            isFreeBridge(this.node.type) ||
            BRIDGE_CONNECTIONS[this.category][this.node.type].includes(other)
        );
    }

    canConnectTo(other: BlueprintEntry): boolean {
        return this.canConnectoToBridge(other.node.type) && super.canConnectTo(other);
    }

    protected _positionChildren(): void {
        super._positionChildren();

        if (this.connectorComponent) {
            this.verticalAlign(this.connectorComponent, 0);
        }
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

function isFreeBridge(type: NodeType) {
    return FREE_BRIDGES.includes(type) || isCustomNodeType(type);
}

type NodeConnectionsList = Record<NodeType, NodeType[]>;

export { BlueprintBridgeEntry };
