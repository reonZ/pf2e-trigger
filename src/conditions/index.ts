import { R, localize } from "module-helpers";
import { TriggerEventEntry } from "../events";
import {
    ExtractTriggerInputValue,
    TriggerInput,
    TriggerInputEntry,
    getDefaultInputValue,
    getInputLabel,
    hasValidInputValue,
} from "../inputs";
import { PreparedTrigger, TriggerCache } from "../trigger";
import { hasItemCondition } from "./has-item";
import { hasRollOptionCondition } from "./has-rolloption";
import { insideAuraCondition } from "./inside-aura";
import { notItemCondition } from "./not-item";
import { notRollOptionCondition } from "./not-rolloption";

const CONDITIONS: Map<string, TriggerConditionEntry> = new Map();

function initializeConditions() {
    const conditionEntries = [
        insideAuraCondition(),
        hasItemCondition(),
        notItemCondition(),
        hasRollOptionCondition(),
        notRollOptionCondition(),
    ];

    for (const conditionEntry of conditionEntries) {
        CONDITIONS.set(conditionEntry.key, conditionEntry);
    }
}

function getConditionEntry(key: string) {
    return CONDITIONS.get(key);
}

function getConditionEntries() {
    return [...CONDITIONS.values()];
}

function createNewCondition(key: string, isSource: boolean): TriggerCondition | undefined {
    const conditionEntry = getConditionEntry(key);
    if (!conditionEntry) return;

    return {
        key,
        isSource,
        id: foundry.utils.randomID(),
        value: getDefaultInputValue(conditionEntry),
    };
}

function createConditionEntry<TInput extends TriggerInputEntry>(
    input: TInput,
    test: TriggerConditionEntryTest<TInput>,
    options?: TriggerConditionEntryOptions
): TriggerConditionEntry {
    return {
        test,
        ...input,
        ...options,
    };
}

function getConditionLabel(
    condition: Partial<TriggerCondition>,
    conditionEntry: TriggerConditionEntry,
    hasSource: boolean
) {
    const label = getInputLabel(conditionEntry, "condition");
    return conditionEntry.allowSource && hasSource
        ? `${localize("menu", condition.isSource ? "source" : "target")}: ${label}`
        : label;
}

function processConditions(
    trigger: DeepPartial<PreparedTrigger>,
    eventEntry: TriggerEventEntry
): trigger is {
    requiredConditions: Record<string, TriggerCondition>;
    optionalConditions: TriggerCondition[];
} {
    const uniques: string[] = [];

    const isValid = (
        conditionEntry: TriggerConditionEntry,
        condition: Maybe<DeepPartial<TriggerCondition>> = {}
    ): condition is TriggerInput => {
        if (!R.isString(condition?.key)) return false;

        const key = conditionEntry.key;
        const isUnique = !!conditionEntry.unique;

        if ((isUnique && uniques.includes(key)) || !hasValidInputValue(conditionEntry, condition)) {
            return false;
        }

        if (isUnique) {
            uniques.push(key);
        }

        return true;
    };

    const sources: TriggerConditionEntrySource[] = [];

    const requiredConditions = (trigger.requiredConditions ??= {});
    for (const conditionEntry of eventEntry.conditions) {
        const key = conditionEntry.key;
        const condition = requiredConditions[key];

        if (!isValid(conditionEntry, condition)) {
            return false;
        }

        if (R.isFunction(conditionEntry.sources)) {
            sources.push(conditionEntry.sources);
        }
    }

    trigger.optionalConditions = R.pipe(
        (trigger.optionalConditions ?? []) as DeepPartial<TriggerCondition>[],
        R.map((condition) => {
            const key = condition?.key;
            if (!key) return;

            const conditionEntry = getConditionEntry(key);
            if (!conditionEntry || !isValid(conditionEntry, condition)) return;

            if (R.isFunction(conditionEntry.sources)) {
                sources.push(conditionEntry.sources);
            }

            return condition;
        }),
        R.filter(R.isTruthy)
    );

    if (sources.length) {
        trigger.sources = sources;
    } else {
        trigger.optionalConditions = R.pipe(
            trigger.optionalConditions as TriggerCondition[],
            R.filter((condition) => !condition.isSource)
        );
    }

    return true;
}

type TriggerConditionEntryOptions = {
    unique?: boolean;
    allowSource?: boolean;
    sources?: TriggerConditionEntrySource;
    _enable?: () => Promisable<void>;
    _disable?: () => Promisable<void>;
};

type TriggerConditionEntrySource = (target: TargetDocuments) => Promisable<TargetDocuments[]>;

type TriggerConditionEntryTest<TInput extends TriggerInputEntry> = (
    target: TargetDocuments,
    value: ExtractTriggerInputValue<TInput>,
    cached: TriggerCache,
    source: TargetDocuments | undefined
) => Promisable<boolean>;

type TriggerConditionEntry<TInput extends TriggerInputEntry = TriggerInputEntry> = TInput &
    TriggerConditionEntryOptions & {
        test: TriggerConditionEntryTest<TInput>;
    };

type TriggerCondition = TriggerInput & {
    id: string;
    isSource: boolean;
};

export {
    createConditionEntry,
    createNewCondition,
    getConditionEntries,
    getConditionEntry,
    getConditionLabel,
    initializeConditions,
    processConditions,
};
export type { TriggerCondition, TriggerConditionEntry, TriggerConditionEntrySource };

// const CONDITIONS = [auraSlug, itemUuid] as const;
// const CONDITIONS_MAP = new Map(CONDITIONS.map((event) => [event.key, event] as const));

// function getCondition<K extends TriggerConditionType>(key: K) {
//     return CONDITIONS_MAP.get(key) as ExtractTriggerCondition<K> | undefined;
// }

// function getConditions() {
//     return foundry.utils.deepClone(CONDITIONS);
// }

// function createCondition<K extends TriggerConditionType>(
//     key: K,
//     isSource: boolean
// ): TriggerCondition | undefined {
//     const condition = getCondition(key);
//     if (!condition) return;

//     return {
//         id: foundry.utils.randomID(),
//         key,
//         value: getDefaultInputValue(condition),
//         isSource: !!(condition as ITriggerCondition).allowSource && isSource,
//     };
// }

// function getConditionLabel(
//     triggerCondition: { isSource?: boolean },
//     condition: { key: TriggerConditionType; allowSource?: boolean; label?: string },
//     event: TriggerEvent
// ) {
//     const label = getInputLabel(condition, "condition");
//     return condition.allowSource && event.hasSource
//         ? `${localize("menu", triggerCondition.isSource ? "source" : "target")}: ${label}`
//         : label;
// }

// type ITriggerCondition = TriggerInput & {
//     unique?: boolean;
//     allowSource?: boolean;
//     test: (
//         actor: ActorPF2e,
//         value: ExtractTriggerInputValue<TriggerInput>,
//         cache: { [k: string]: any }
//     ) => Promisable<boolean>;
// };

// type TriggerConditionEntry = (typeof CONDITIONS)[number];
// type TriggerConditionType = TriggerConditionEntry["key"];
// type TriggerCondition = ExtractTriggerInput<TriggerConditionEntry> & {
//     id: string;
//     isSource: boolean;
// };

// type ExtractTriggerCondition<K extends TriggerConditionType> = Extract<
//     TriggerConditionEntry,
//     { key: K }
// > &
//     Omit<ITriggerCondition, keyof Extract<TriggerConditionEntry, { key: K }>>;

// export { createCondition, getCondition, getConditionLabel, getConditions };
// export type { ITriggerCondition, TriggerCondition, TriggerConditionEntry, TriggerConditionType };
