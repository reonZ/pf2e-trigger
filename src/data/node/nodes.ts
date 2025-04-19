import { ExtendedDocumentCollection, MODULE } from "module-helpers";
import { TriggerNodeData } from "data";

class TriggerNodeCollection extends ExtendedDocumentCollection<TriggerNodeData> {
    static documentName = "Node";

    get documentClass() {
        return TriggerNodeData as any;
    }
}

MODULE.devExpose({ TriggerNodeCollection });

export { TriggerNodeCollection };
