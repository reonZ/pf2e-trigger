import { BlueprintValueEntry } from "./blueprint-entry-value";

class BlueprintConverterEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintValueEntry<TCategory> {
    protected _createLabel() {
        return new PIXI.Container();
    }

    protected _positionChildren() {
        super._positionChildren();

        if (this.connectorComponent) {
            this.connectorComponent.y = this.connectorComponent.y - 1;

            if (this.category === "outputs") {
                this.connectorComponent.x = this.connectorComponent.x - this.spacing;
            }
        }
    }
}

export { BlueprintConverterEntry };
