import { R, localize, localizeIfExist } from "module-helpers";

const TRIGGER_INPUT_DEFAULT = {
    text: "",
    uuid: "",
    checkbox: false,
    select: "",
    number: 0,
} as const;

function getDefaultInputValue(inputEntry: TriggerInputEntry) {
    return inputEntry.default ?? TRIGGER_INPUT_DEFAULT[inputEntry.type];
}

function hasValidInputValue<TType extends TriggerInputType, TInput extends Partial<TriggerInput>>(
    entry: TriggerInputEntries[TType],
    input: TInput
): input is TInput & { value: TriggerInputValueTypes[TType] } {
    return isValidInputValue(entry, input.value);
}

function isValidInputValue<TType extends TriggerInputType>(
    entry: TriggerInputEntries[TType],
    value: any
): value is TriggerInputValueType {
    return (
        typeof value === typeof TRIGGER_INPUT_DEFAULT[entry.type] &&
        (entry.type !== "select" || isSelectOption(entry, value))
    );
}

function isSelectOption(
    { options }: Partial<TriggerInputEntrySelect>,
    value: any
): value is string {
    return (
        R.isString(value) &&
        R.isArray(options) &&
        options.some((option) =>
            R.isPlainObject(option) ? option.value === value : option === value
        )
    );
}

function getInputItem(
    { type }: TriggerInputEntry,
    value: any
): ClientDocument | CompendiumIndexData | null {
    return type === "uuid" && R.isString(value) ? fromUuidSync(value) : null;
}

function getInputOptions(inputEntry: TriggerInputEntry, ...path: string[]) {
    if (inputEntry.type !== "select") {
        return null;
    }

    return R.pipe(
        inputEntry.options,
        R.map((option): { value: string; label: string } => {
            const isString = R.isString(option);
            const rawLabel = !isString && R.isString(option.label) ? option.label : null;
            const value = isString ? option : option.value;
            const label = rawLabel
                ? game.i18n.localize(rawLabel)
                : localize(...path, inputEntry.key, "option", value);

            return { value, label };
        })
    );
}

function getInputPlaceholder({ key, placeholder, type }: TriggerInputEntry, ...path: string[]) {
    return placeholder
        ? game.i18n.localize(placeholder)
        : localizeIfExist(...path, key, "placeholder") ?? localize("input", type);
}

function getInputNumberData(inputEntry: TriggerInputEntry) {
    if (inputEntry.type !== "number") {
        return null;
    }

    return {
        min: inputEntry.min,
        max: inputEntry.max,
        step: inputEntry.step ?? 1,
    };
}

function getInputData(inputEntry: TriggerInputEntry, value: any, ...path: string[]) {
    return {
        ...getInputNumberData(inputEntry),
        item: getInputItem(inputEntry, value),
        options: getInputOptions(inputEntry, ...path),
        placeholder: getInputPlaceholder(inputEntry, ...path),
    };
}

function getInputLabel({ label, key }: TriggerInputEntry, ...path: string[]) {
    return R.isString(label)
        ? localizeIfExist(...path, label, "label") ?? game.i18n.localize(label)
        : localize(...path, key, "label");
}

type TriggerInputEntry = TriggerInputEntries[keyof TriggerInputEntries];
type TriggerInputType = keyof typeof TRIGGER_INPUT_DEFAULT;
type TriggerInputValueType = TriggerInputValueTypes[keyof TriggerInputValueTypes];
type TriggerInputValueTypes = ToPrimitive<typeof TRIGGER_INPUT_DEFAULT>;

type TriggerInput = {
    key: string;
    value: TriggerInputValueType;
};

type TriggerInputEntries = {
    text: TriggerInputEntryText;
    uuid: TriggerInputEntryUuid;
    checkbox: TriggerInputEntryCheckbox;
    select: TriggerInputEntrySelect;
    number: TriggerInputEntryNumber;
};

type TriggerInputEntryBase<TType extends TriggerInputType> = {
    type: TType;
    key: string;
    label?: string;
    optional?: boolean;
    placeholder?: string;
    default?: TriggerInputValueTypes[TType];
};

type TriggerInputEntryText = TriggerInputEntryBase<"text">;

type TriggerInputEntryUuid = TriggerInputEntryBase<"uuid">;

type TriggerInputEntryNumber = TriggerInputEntryBase<"number"> & {
    min?: number;
    max?: number;
    step?: number;
};

type TriggerInputEntryCheckbox = TriggerInputEntryBase<"checkbox">;

type TriggerInputEntrySelectOptions = {
    value: string;
    label?: string;
};

type TriggerInputEntrySelect = TriggerInputEntryBase<"select"> & {
    options: (string | TriggerInputEntrySelectOptions)[];
};

type ExtractTriggerInputValueType<TInput extends TriggerInputEntry> = TInput extends {
    type: infer TType extends TriggerInputType;
}
    ? TType extends "select"
        ? TInput extends { options: infer TOption extends string[] }
            ? TOption[number]
            : TInput extends { options: { value: infer TValue extends string }[] }
            ? TValue
            : never
        : TriggerInputValueTypes[TType]
    : never;

type ExtractTriggerInputValue<TInput extends TriggerInputEntry> = TInput extends {
    optional: true;
}
    ? ExtractTriggerInputValueType<TInput> | undefined
    : ExtractTriggerInputValueType<TInput>;

export { getDefaultInputValue, getInputData, getInputLabel, hasValidInputValue, isValidInputValue };
export type {
    ExtractTriggerInputValue,
    ExtractTriggerInputValueType,
    TriggerInput,
    TriggerInputEntries,
    TriggerInputEntry,
    TriggerInputType,
    TriggerInputValueType,
};
