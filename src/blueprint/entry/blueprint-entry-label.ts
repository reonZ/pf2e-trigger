import { BlueprintEntry } from "./blueprint-entry";

class BlueprintLabelEntry<
    TCategory extends NodeEntryCategory = NodeEntryCategory
> extends BlueprintEntry<TCategory> {
    get canConnect(): boolean {
        return false;
    }

    get hasConnector(): boolean {
        return false;
    }

    protected _fillConnector(connector: PIXI.Graphics) {}
}

export { BlueprintLabelEntry };
