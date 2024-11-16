import { SAVE_TYPES } from "foundry-pf2e";
import { Trigger, TriggerActions, TriggerInputEntry, TriggerInputValueType } from "../trigger";
import { TriggerEventAction } from "./base";

class RollSaveAction extends TriggerEventAction {
    get type(): "roll-save" {
        return "roll-save";
    }

    get icon(): string {
        return "fa-solid fa-dice-d20";
    }

    get options() {
        return [
            {
                name: "save",
                type: "select",
                required: true,
                options: [
                    { value: "fortitude", label: "PF2E.SavesFortitude" },
                    { value: "reflex", label: "PF2E.SavesReflex" },
                    { value: "will", label: "PF2E.SavesWill" },
                ],
                localize: true,
            },
            {
                name: "dc",
                type: "number",
                required: true,
                default: 15,
                min: 5,
            },
        ] as const satisfies Readonly<TriggerInputEntry[]>;
    }

    get linkOption() {
        return {
            name: "success",
            type: "select",
            localize: true,
            default: "2",
            options: [
                {
                    value: "3",
                    label: "PF2E.Check.Result.Degree.Check.criticalSuccess",
                },
                {
                    value: "2",
                    label: "PF2E.Check.Result.Degree.Check.success",
                },
                {
                    value: "1",
                    label: "PF2E.Check.Result.Degree.Check.failure",
                },
                {
                    value: "0",
                    label: "PF2E.Check.Result.Degree.Check.criticalFailure",
                },
            ],
        } as const satisfies Readonly<TriggerInputEntry>;
    }

    async execute(
        actor: ActorPF2e,
        trigger: Trigger,
        action: TriggerActions["roll-save"],
        linkOption: TriggerInputValueType,
        options: {}
    ) {
        const save = action.options.save;
        if (!SAVE_TYPES.includes(save)) return false;

        const actorSave = actor.saves?.[save];
        if (!actorSave) return false;

        const roll = await actorSave.roll({ dc: action.options.dc });
        if (!roll) return false;

        const threshold = Number(linkOption);
        return isNaN(threshold) ? true : (roll.degreeOfSuccess ?? 2) >= threshold;
    }
}

export { RollSaveAction };
