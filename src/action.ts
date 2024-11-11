import { ExtractTriggerInputs, TriggerInputEntry } from "./trigger";

const TRIGGER_ACTIONS = ["rollDamage"] as const;

const rollDamageAction = {
    type: "rollDamage",
    icon: "fa-solid fa-sword",
    options: [
        { name: "formula", type: "text", required: true },
        { name: "item", type: "uuid", required: true },
    ],
} as const satisfies TriggerActionEntry;

const ACTIONS = [rollDamageAction] as const;

const ACTIONS_MAP = new Collection(ACTIONS.map((action) => [action.type, action]));

type TriggerActionType = (typeof TRIGGER_ACTIONS)[number];

type TriggerActionEntry = {
    type: TriggerActionType;
    icon: string;
    options: TriggerInputEntry[];
    linked?: boolean;
};

type TriggerAction = (typeof ACTIONS)[number];

type TriggerActions = TriggerAction extends { type: infer TType extends TriggerActionType }
    ? {
          [k in TType]: ExtractTriggerInputs<Extract<TriggerAction, { type: k }>["options"]> & {
              usedOptions: {
                  [c in Extract<TriggerAction, { type: k }>["options"][number]["name"]]: boolean;
              };
              linked?: boolean;
          };
      }
    : never;

export { ACTIONS, ACTIONS_MAP, TRIGGER_ACTIONS };
export type { TriggerActions, TriggerActionType };
