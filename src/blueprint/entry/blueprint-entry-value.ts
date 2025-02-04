import { BlueprintEntry } from "./blueprint-entry";

class BlueprintValueEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintEntry<TCategory> {
    get canConnect(): boolean {
        return (
            this.category === "outputs" ||
            (this.node.type !== "variable" && this.connections.length === 0)
        );
    }

    protected _fillConnector(connector: PIXI.Graphics) {
        connector.lineStyle({ color: this.connectorColor, width: 2 });
        connector.drawCircle(5, 6, 6);
    }

    protected _positionChildren(): void {
        super._positionChildren();

        if (this.connectorComponent) {
            this.verticalAlign(this.connectorComponent, 1);
        }
    }
}

export { BlueprintValueEntry };
