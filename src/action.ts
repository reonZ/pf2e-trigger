import { ExtractTriggerInputs, TriggerInputEntry } from "./trigger";

const TRIGGER_ACTIONS = ["rollDamage", "rollSave"] as const;

const rollDamageAction = {
    type: "rollDamage",
    icon: "fa-solid fa-sword",
    options: [
        { name: "formula", type: "text", required: true },
        { name: "item", type: "uuid", required: true },
    ],
} as const satisfies TriggerActionEntry;

const rollSaveAction = {
    type: "rollSave",
    icon: "",
    options: [{ name: "dc", type: "number", required: true }],
} as const satisfies TriggerActionEntry;

const ACTIONS = [rollDamageAction, rollSaveAction] as const;

const ACTIONS_MAP = new Collection(ACTIONS.map((action) => [action.type, action]));

type TriggerActionType = (typeof TRIGGER_ACTIONS)[number];

type TriggerActionEntry = {
    type: TriggerActionType;
    icon: string;
    options: TriggerInputEntry[];
    linked?: boolean;
};

type TriggerAction = TriggerActions[keyof TriggerActions];

type TriggerActionOptions<TType extends TriggerActionType = TriggerActionType> =
    TriggerActions[TType]["options"];

type TriggerActions = (typeof ACTIONS)[number] extends {
    type: infer TType extends TriggerActionType;
}
    ? {
          [k in TType]: {
              type: k;
              options: ExtractTriggerInputs<
                  Extract<(typeof ACTIONS)[number], { type: k }>["options"]
              >;
              usedOptions: {
                  [c in Extract<
                      (typeof ACTIONS)[number],
                      { type: k }
                  >["options"][number]["name"]]: boolean;
              };
              linked?: boolean;
          };
      }
    : never;

export { ACTIONS, ACTIONS_MAP, TRIGGER_ACTIONS };
export type { TriggerAction, TriggerActionOptions, TriggerActions, TriggerActionType };
