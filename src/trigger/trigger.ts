import { InsideAuraTriggerCondition } from "./node/condition/trigger-condition-inside-aura";
import { BaseTrigger } from "./trigger-base";
import { Subtrigger } from "./trigger-subtrigger";

class Trigger extends BaseTrigger {
    #insideAura: InsideAuraTriggerCondition | undefined;

    constructor(triggerData: TriggerData, subtriggers: Record<string, Subtrigger>) {
        super(triggerData, subtriggers);

        this.#insideAura = this.nodes.find(
            (x): x is InsideAuraTriggerCondition => x instanceof InsideAuraTriggerCondition
        );
    }

    get insideAura(): InsideAuraTriggerCondition | undefined {
        return this.#insideAura;
    }
}

export { Trigger };
