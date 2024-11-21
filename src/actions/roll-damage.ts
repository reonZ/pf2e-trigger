import { isInstanceOf, R, rollDamageFromFormula } from "module-helpers";
import {
    EVENTS_MAP,
    Trigger,
    TriggerActions,
    TriggerInputEntry,
    TriggerInputValueType,
    TriggerRunOptions,
} from "../trigger";
import { TriggerEventAction } from "./base";

class RollDamageAction extends TriggerEventAction {
    get type(): "roll-damage" {
        return "roll-damage";
    }

    get icon(): string {
        return "fa-solid fa-sword";
    }

    get options() {
        return [
            {
                name: "formula",
                type: "text",
                required: true,
            },
            {
                name: "item",
                type: "uuid",
                required: true,
            },
            {
                name: "self",
                type: "checkbox",
            },
        ] as const satisfies Readonly<TriggerInputEntry[]>;
    }

    getOrigin(target: TargetDocuments, trigger: Trigger, options: TriggerRunOptions) {
        const event = EVENTS_MAP.get(trigger.event);
        return event?.getOrigin(target, trigger, options);
    }

    async execute(
        target: TargetDocuments,
        trigger: Trigger,
        action: TriggerActions["roll-damage"],
        linkOption: TriggerInputValueType,
        options: { origin?: TargetDocuments },
        cache: {}
    ) {
        if (!R.isString(action.options.formula) || !R.isString(action.options.item)) return false;

        const item = await fromUuid(action.options.item);
        if (!isInstanceOf(item, "ItemPF2e")) return false;

        await rollDamageFromFormula(action.options.formula, {
            item,
            target,
            origin: action.options.self ? target : this.getOrigin(target, trigger, options),
        });

        return true;
    }
}

export { RollDamageAction };
