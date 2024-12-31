import { R, localize } from "module-helpers";
import {
    ExtractTriggerInputValueType,
    TriggerInputEntry,
    TriggerInputValueType,
    getDefaultInputValue,
    isValidInputValue,
} from "../inputs";
import { PreparedTrigger, TriggerCache, TriggerRunOptions } from "../trigger";
import { addItemAction } from "./add-item";
import { removeItemAction } from "./remove-item";
import { rollDamageAction } from "./roll-damage";
import { rollSaveAction } from "./roll-save";

const ACTIONS: Map<string, TriggerActionEntry> = new Map();

function initializeActions() {
    const actionEntries = [
        addItemAction(),
        removeItemAction(),
        rollSaveAction(),
        rollDamageAction(),
    ];

    for (const actionEntry of actionEntries) {
        ACTIONS.set(actionEntry.key, actionEntry);
    }
}

function getActionEntry(key: string) {
    return ACTIONS.get(key);
}

function getActionEntries() {
    return [...ACTIONS.values()];
}

function createNewAction(key: string): TriggerAction | undefined {
    const actionEntry = getActionEntry(key);
    if (!actionEntry) return;

    const options = {} as Record<string, TriggerInputValueType>;

    for (const option of R.values(actionEntry.options)) {
        const optionKey = option.key;
        options[optionKey] = getDefaultInputValue(option);
    }

    return {
        id: foundry.utils.randomID(),
        key,
        options,
        linked: false,
        endProcess: false,
    };
}

function createActionEntry<TOptions extends TriggerActionEntryOption[]>(
    key: string,
    icon: string,
    options: TOptions,
    execute: TriggerActionEntryExecute<TOptions>
): TriggerActionEntry {
    return {
        key,
        icon,
        options,
        execute: execute as unknown as TriggerActionEntry["execute"],
    };
}

function getActionLabel(key: string) {
    return localize("action", key, "label");
}

function processActions(
    trigger: DeepPartial<PreparedTrigger>
): trigger is { actions: TriggerAction[] } {
    trigger.actions = R.pipe(
        (trigger.actions ?? []) as DeepPartial<TriggerAction>[],
        R.map((action, actionIndex) => {
            const actionKey = action.key;
            const options = action.options as
                | Record<string, TriggerInputValueType | undefined>
                | undefined;
            if (!R.isString(actionKey) || !R.isPlainObject(options)) return;

            const actionEntry = getActionEntry(actionKey);
            if (!actionEntry) return;

            const linkedToNext = !!trigger.actions?.at(actionIndex + 1)?.linked;
            const processedOptions: Record<string, TriggerInputValueType> = {};

            for (const optionEntry of actionEntry.options) {
                if (!linkedToNext && optionEntry.ifLinked) continue;
                if (!trigger.sources && optionEntry.ifHasSource) continue;

                const optionKey = optionEntry.key;
                const value = options[optionKey];

                if (isValidInputValue(optionEntry, value)) {
                    processedOptions[optionKey] = value;
                } else if (optionEntry.optional) {
                    continue;
                } else {
                    return;
                }
            }

            action.options = processedOptions;

            if (!trigger.actions?.at(actionIndex - 1)) {
                action.endProcess = false;
                action.linked = false;
            } else if (!action.linked || linkedToNext) {
                action.endProcess = false;
            }

            return R.isEmpty(action.options) ? undefined : action;
        }),
        R.filter(R.isTruthy)
    );

    return trigger.actions.length > 0;
}

type TriggerActionEntry = {
    key: string;
    icon: string;
    options: TriggerActionEntryOption[];
    execute: (
        ...args: TriggerActionEntryExecuteOptions<Record<string, TriggerInputValueType | undefined>>
    ) => Promisable<boolean>;
};

type TriggerActionEntryExecuteOptions<
    TOptions extends Record<string, TriggerInputValueType | undefined>
> = [target: TargetDocuments, options: TOptions, cached: TriggerCache, extras: TriggerRunOptions];

type TriggerActionEntryExecute<TOptions extends TriggerActionEntryOption[]> = (
    ...args: TriggerActionEntryExecuteOptions<ExtractTriggerActionOptions<TOptions>>
) => Promisable<boolean>;

type TriggerActionEntryOption = TriggerInputEntry & {
    ifHasSource?: boolean;
    ifLinked?: boolean;
};

type TriggerAction = {
    id: string;
    key: string;
    linked: boolean;
    endProcess: boolean;
    options: Record<string, TriggerInputValueType>;
};

type ExtractTriggerActionOptions<TOptions extends TriggerActionEntryOption[]> = TOptions extends {
    key: infer TKey extends string;
}[]
    ? { [k in TKey]: ExtraxTriggerActionOptionValue<Extract<TOptions[number], { key: k }>> }
    : never;

type ExtraxTriggerActionOptionValue<TOption extends TriggerActionEntryOption> = TOption extends
    | { ifHasSource: true }
    | { ifLinked: true }
    | { optional: true }
    ? ExtractTriggerInputValueType<TOption> | undefined
    : ExtractTriggerInputValueType<TOption>;

export {
    createActionEntry,
    createNewAction,
    getActionEntries,
    getActionEntry,
    getActionLabel,
    initializeActions,
    processActions,
};
export type { TriggerAction, TriggerActionEntry };

// const ACTIONS = [rollDamage, rollSave, removeItem] as const;
// const ACTIONS_MAP = new Map(ACTIONS.map((event) => [event.key, event] as const));

// function getAction<K extends TriggerActionType>(key: K) {
//     return ACTIONS_MAP.get(key) as ExtractTriggerAction<K> | undefined;
// }

// function createAction<K extends TriggerActionType>(key: K) {
//     const condition = getAction(key) as Extract<TriggerActionEntry, { key: K }>;
//     if (!condition) return;

//     const options = {} as Record<string, TriggerInputValueType>;

//     for (const option of R.values(condition.options)) {
//         const optionKey = option.key;
//         options[optionKey] = getDefaultInputValue(option);
//     }

//     return {
//         id: foundry.utils.randomID(),
//         key,
//         options,
//         usedOptions: [],
//     } as unknown as Extract<TriggerAction, { key: K }>;
// }

// function getActionLabel(action: { key: TriggerActionType; label?: string }, event: TriggerEvent) {
//     return getInputLabel(action, "action");
// }

// type ITriggerAction = {
//     key: string;
//     icon: string;
//     options: TriggerInput[];
//     linkOptions?: TriggerInput[];
//     execute: () => Promisable<boolean>;
// };

// type TriggerActionEntry = (typeof ACTIONS)[number];
// type TriggerActionType = TriggerActionEntry["key"];
// type TriggerAction = TriggerActionEntry extends { key: infer TKey extends TriggerActionType }
//     ? {
//           [k in TKey]: {
//               id: string;
//               key: Extract<TriggerActionEntry, { key: k }>["key"];
//               usedOptions: string[];
//               options: Extract<TriggerActionEntry, { key: k }> extends {
//                   options: infer TOptions extends TriggerInput[];
//               }
//                   ? TOptions[number] extends { key: infer O extends string }
//                       ? {
//                             [o in O]: ExtractTriggerInputValue<
//                                 Extract<TOptions[number], { key: o }>
//                             >;
//                         }
//                       : never
//                   : never;
//           };
//       }[TKey]
//     : never;

// type ExtractTriggerAction<K extends TriggerActionType> = Extract<TriggerActionEntry, { key: K }> &
//     Omit<ITriggerAction, keyof Extract<TriggerActionEntry, { key: K }>>;

// export { createAction, getAction, getActionLabel };
// export type { ITriggerAction, TriggerAction, TriggerActionEntry, TriggerActionType };
