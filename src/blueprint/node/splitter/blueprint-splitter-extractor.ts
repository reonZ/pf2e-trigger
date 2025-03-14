import { makeCustomNode } from "../blueprint-node-custom";
import { SplitterBlueprintNode } from "./blueprint-splitter";

class DocumentExtractorBlueprintNode extends makeCustomNode(SplitterBlueprintNode) {
    get context() {
        return ["add-entry", ...super.context];
    }

    async _onContext(context: string): Promise<void> {
        switch (context) {
            case "add-entry": {
                this.addEntry("outputs", {
                    valueLabel: "path",
                    types: ["boolean", "number", "text"],
                });
                return;
            }

            default: {
                return super._onContext(context);
            }
        }
    }
}

export { DocumentExtractorBlueprintNode };
