import { ExtendedDocumentCollection, getSetting, MODULE } from "module-helpers";
import { PartialTriggerDataSource, TriggerData } from "data";

class TriggerDataCollection extends ExtendedDocumentCollection<TriggerData> {
    static documentName = "Trigger";
    static #instance = new TriggerDataCollection();

    static refresh() {
        const instance = this.#instance;
        const sources = game.ready ? getSetting<PartialTriggerDataSource[]>("world-triggers") : [];

        instance.fullClear();
        instance._source.push(...(sources as any));
        instance._initialize();

        MODULE.debug(instance);
    }

    get documentClass() {
        return TriggerData as any;
    }
}

MODULE.devExpose({ TriggerDataCollection });

export { TriggerDataCollection };
