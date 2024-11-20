import { isInstanceOf, R, resolveTarget, rollDamageFromFormula } from "foundry-pf2e";
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

    getOrigin(actor: ActorPF2e, trigger: Trigger, options: TriggerRunOptions) {
        const event = EVENTS_MAP.get(trigger.event);
        return event?.getOrigin(actor, trigger, options);
    }

    async execute(
        actor: ActorPF2e,
        trigger: Trigger,
        action: TriggerActions["roll-damage"],
        linkOption: TriggerInputValueType,
        options: { token?: TokenDocumentPF2e<ScenePF2e>; origin?: TargetDocuments },
        cache: {}
    ) {
        if (!R.isString(action.options.formula) || !R.isString(action.options.item)) return false;

        const item = await fromUuid(action.options.item);
        if (!isInstanceOf(item, "ItemPF2e")) return false;

        const target = resolveTarget({ actor, token: options.token });
        await rollDamageFromFormula(action.options.formula, {
            item,
            target,
            origin: action.options.self ? target : this.getOrigin(actor, trigger, options),
        });

        return true;
    }
}

export { RollDamageAction };
