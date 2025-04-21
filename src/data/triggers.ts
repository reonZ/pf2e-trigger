import { TriggerData, TriggerDataSource } from "data";
import { ExtendedDocumentCollection, getSetting, MODULE } from "module-helpers";

class TriggerDataCollection extends ExtendedDocumentCollection<TriggerData> {
    static documentName = "Trigger";
    static #instance = new TriggerDataCollection();

    static refresh() {
        const instance = this.#instance;
        const sources = game.ready ? getSetting<TriggerDataSource[]>("world-triggers") : [];

        instance.fullClear();
        instance._source.push(...sources);
        instance._initialize();

        MODULE.debug("Triggers\n", instance);
    }

    get documentClass() {
        return TriggerData as any;
    }
}

MODULE.devExpose({ TriggerDataCollection });

export { TriggerDataCollection };
