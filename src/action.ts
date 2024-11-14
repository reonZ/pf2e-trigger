import { R } from "foundry-pf2e";
import {
    defaultInputValue,
    ExtractTriggerInputs,
    TriggerInputEntry,
    TriggerInputValueType,
} from "./trigger";

const TRIGGER_ACTIONS = ["rollDamage", "rollSave"] as const;

const rollDamageAction = {
    type: "rollDamage",
    icon: "fa-solid fa-sword",
    options: [
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
    ],
} as const satisfies TriggerActionEntry;

const rollSaveAction = {
    type: "rollSave",
    icon: "fa-solid fa-dice-d20",
    options: [
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
            name: "basic",
            type: "checkbox",
        },
        {
            name: "dc",
            type: "number",
            required: true,
            default: 15,
            min: 5,
        },
    ],
    linkOption: {
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
    },
} as const satisfies TriggerActionEntry;

const ACTIONS = [rollDamageAction, rollSaveAction] as const;

const ACTIONS_MAP: Collection<TriggerActionEntry> = new Collection(
    ACTIONS.map((action) => [action.type, action])
);

function createAction<TType extends TriggerActionType>(type: TType): TriggerAction | undefined {
    const action = ACTIONS_MAP.get(type);
    if (!action) return;

    const usedOptions = {} as Record<string, boolean>;
    const options = R.pipe(
        action.options,
        R.map((option): [string, TriggerInputValueType] => {
            const name = option.name;
            const value = defaultInputValue(option);

            usedOptions[name] = !!option.required;
            return [option.name, value] as const;
        }),
        R.fromEntries()
    );

    return {
        type,
        options,
        usedOptions,
        linked: false,
    };
}

type TriggerActionOptions<TType extends TriggerActionType = TriggerActionType> =
    ExtractTriggerInputs<Extract<(typeof ACTIONS)[number], { type: TType }>["options"]>;

type TriggerActionType = (typeof TRIGGER_ACTIONS)[number];

type TriggerActionEntry = {
    type: TriggerActionType;
    icon: string;
    options: TriggerInputEntry[];
    linkOption?: TriggerInputEntry;
};

type TriggerAction = {
    type: TriggerActionType;
    linked: boolean;
    options: Record<string, TriggerInputValueType>;
    usedOptions: Record<string, boolean>;
    linkOption?: TriggerInputValueType;
};

export { ACTIONS, ACTIONS_MAP, createAction, TRIGGER_ACTIONS };
export type { TriggerAction, TriggerActionEntry, TriggerActionOptions, TriggerActionType };
