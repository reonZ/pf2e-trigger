import {
    addListenerAll,
    arrayToSelect,
    confirmDialog,
    createFormData,
    getSetting,
    htmlClosest,
    htmlQueryInClosest,
    htmlQueryInParent,
    info,
    isInstanceOf,
    localize,
    R,
    setSetting,
    templateLocalize,
    templatePath,
} from "module-helpers";
import { TriggerEventAction } from "../actions/base";
import {
    ACTIONS_MAP,
    createAction,
    createTrigger,
    EVENTS_MAP,
    getSubInputs,
    isInputType,
    Trigger,
    TriggerAction,
    TriggerActionType,
    TriggerEventType,
    TriggerInputEntry,
    TriggerInputs,
    TriggerInputType,
    TriggerInputValueType,
} from "../trigger";
import { ActionImporter, TriggerImporter } from "./import";

class CustomTriggers extends FormApplication {
    #events: { value: TriggerEventType; label: string }[];
    #actions: { value: TriggerActionType; label: string }[];
    #triggers: CustomTrigger[];
    #highlight: number[] = [];

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "pf2e-trigger-customs",
            title: localize("customs.title"),
            template: templatePath("customs"),
            width: 800,
            height: 800,
            submitOnChange: false,
            submitOnClose: false,
            closeOnSubmit: false,
            scrollY: [".triggers"],
        });
    }

    constructor(object?: any, options?: Partial<FormApplicationOptions>) {
        super(object, options);

        this.#events = arrayToSelect(EVENTS_MAP.keys(), (value) => localize("events", value));
        this.#actions = arrayToSelect(ACTIONS_MAP.keys(), (value) => localize("actions", value));

        this.#triggers = foundry.utils.deepClone(getSetting<CustomTrigger[]>("customTriggers"));
    }

    async _render(force?: boolean, options?: CustomTriggersRenderOptions): Promise<void> {
        await super._render(force, options);

        requestAnimationFrame(() => {
            this._restoreScrollPositions(this.element);
        });
    }

    render(force?: boolean, options?: CustomTriggersRenderOptions): this {
        if (this.rendered) {
            this.#triggers = options?.triggers ?? this.generateTriggersData(true);
            this.#highlight = options?.highlight ?? [];
        }

        return super.render(force, options);
    }

    generateTriggersData(readonly: boolean = false) {
        type TemplateTrigger = Omit<CustomTrigger, "actions"> & {
            actions?: Record<
                number,
                TriggerAction & {
                    showInactives?: boolean;
                }
            >;
        };

        const data: { triggers?: Record<number, TemplateTrigger> } = createFormData(this.form, {
            disabled: true,
            readonly,
            expand: true,
        });

        const triggers = R.pipe(
            R.entries(data.triggers ?? {}),
            R.sortBy(([index]) => Number(index)),
            R.map(([_, trigger]): CustomTrigger => {
                const actions = R.pipe(
                    R.entries(trigger.actions ?? {}),
                    R.sortBy(([index]) => Number(index)),
                    R.map(([__, action]) => action)
                );

                return {
                    ...trigger,
                    actions,
                };
            })
        );

        return triggers;
    }

    getData(options?: Partial<FormApplicationOptions>): CustomTriggersData {
        const highlights = this.#highlight.slice();

        this.#highlight.length = 0;

        const triggers = R.pipe(
            this.#triggers,
            R.map((trigger, triggerIndex): CustomDataTrigger | undefined => {
                const event = EVENTS_MAP.get(trigger.event);
                if (!event) return;

                const triggerPath = `triggers.${triggerIndex}`;
                const conditions = processInputEntries(
                    event.conditions,
                    trigger.usedConditions,
                    trigger.conditions,
                    "conditions"
                );

                const actions: CustomTriggerAction[] = R.pipe(
                    trigger.actions,
                    R.map((triggerAction, actionIndex): CustomTriggerAction | undefined => {
                        const action = ACTIONS_MAP.get(triggerAction.type);
                        if (!action) return;

                        const actionPath = `${triggerPath}.actions.${actionIndex}`;
                        const options = processInputEntries(
                            action.options,
                            triggerAction.usedOptions,
                            triggerAction.options,
                            "action-options",
                            { path: `${actionPath}.options` }
                        );

                        return {
                            options,
                            entry: action,
                            type: triggerAction.type,
                            icon: action.icon,
                            index: actionIndex,
                            path: actionPath,
                            label: localize("actions", action.type),
                            linked: !!triggerAction.linked,
                            linkOption: triggerAction.linkOption,
                            showInactives: !!triggerAction.showInactives,
                        };
                    }),
                    R.filter(R.isTruthy),
                    R.forEach((action, index, actions) => {
                        if (!action.linked) return;

                        const previousAction = actions.at(index - 1);
                        const previousEvent = previousAction?.entry;
                        if (!previousEvent) return;

                        const linkOptionName = "valid";
                        const linkOption = previousEvent.linkOption ?? {
                            name: linkOptionName,
                            type: "checkbox",
                            default: true,
                        };

                        if (
                            action.linkOption !== undefined &&
                            !isInputType(linkOption.type, action.linkOption)
                        )
                            return;

                        const { entry } = processInputEntry(
                            linkOption,
                            {},
                            { [linkOptionName]: action.linkOption },
                            "action-options",
                            { path: `${action.path}.linkOption`, hidden: !previousEvent.linkOption }
                        );

                        action.extraOption = entry;
                    })
                );

                return {
                    path: triggerPath,
                    index: triggerIndex,
                    event: trigger.event,
                    icon: event.icon,
                    label: event.label(trigger),
                    conditions,
                    actions,
                    highlight: highlights.includes(triggerIndex),
                    showInactives: !!trigger.showInactives,
                };
            }),
            R.filter(R.isTruthy),
            R.reverse()
        );

        const [leftTriggers, rightTriggers] = R.partition(
            triggers,
            (trigger, index) => index % 2 === 0
        );

        return {
            events: this.#events,
            actions: this.#actions,
            leftTriggers,
            rightTriggers,
            i18n: templateLocalize("customs"),
        };
    }

    activateListeners($html: JQuery<HTMLElement>) {
        const html = this.element[0];

        addListenerAll(html, ".input input, .input select", "change", (event, el) => {
            el.blur();
            this.render();
        });

        addListenerAll(html, ".uuid .input input", "drop", (event, el: HTMLInputElement) => {
            const data = TextEditor.getDragEventData(event);
            if (data.type !== "Item" || !R.isString(data.uuid)) return;

            el.value = data.uuid;
            this.render();
        });

        addListenerAll(html, "[data-action]", async (event, el) => {
            const eventAction = el.dataset.action as EventAction;

            const getTriggerIndex = () => {
                const index = Number(htmlClosest(el, "[data-trigger-index]")?.dataset.triggerIndex);
                return isNaN(index) ? null : index;
            };

            const getActionIndex = () => {
                const index = Number(htmlClosest(el, "[data-action-index]")?.dataset.actionIndex);
                return isNaN(index) ? null : index;
            };

            const getTriggerData = (readonly?: boolean) => {
                const index = getTriggerIndex();
                const triggers = this.generateTriggersData(readonly);
                const trigger = index === null ? undefined : triggers.at(index);
                return { triggers, trigger };
            };

            const getActionData = (readonly?: boolean) => {
                const { trigger, triggers } = getTriggerData(readonly);
                const actionIndex = getActionIndex();
                const actions = trigger?.actions ?? [];
                const action = actionIndex === null ? undefined : actions.at(actionIndex);
                return { trigger, triggers, actions, action };
            };

            switch (eventAction) {
                case "add-trigger": {
                    const type = htmlQueryInParent(el, "select")?.value as Maybe<TriggerEventType>;
                    if (!type) return;

                    const triggers = this.generateTriggersData(false);
                    const event = EVENTS_MAP.get(type);
                    if (!event) return;

                    const trigger = createTrigger(type) as CustomTrigger;

                    trigger.showInactives = true;
                    triggers.push(trigger);

                    this.render(false, { triggers, highlight: [triggers.length - 1] });

                    break;
                }

                case "delete-trigger": {
                    const index = getTriggerIndex();
                    if (index === null) return;

                    const confirm = await confirmDialog(
                        {
                            title: localize("customs.trigger.delete.label"),
                            content: localize("customs.trigger.delete.confirm"),
                        },
                        { animation: false }
                    );

                    if (!confirm) return;

                    const triggers = this.generateTriggersData(true);
                    triggers.splice(index, 1);

                    this.render(false, { triggers });

                    break;
                }

                case "save-triggers": {
                    const triggers = this.generateTriggersData(false);

                    setSetting("customTriggers", triggers);
                    this.close();

                    break;
                }

                case "toggle-entries": {
                    const selector = el.dataset.parent ?? "";
                    const checkbox = htmlQueryInClosest<HTMLInputElement>(
                        el,
                        ".controls",
                        ".toggle-entries"
                    );

                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        htmlClosest(el, selector)?.classList.toggle("expanded", checkbox.checked);
                    }

                    break;
                }

                case "open-item-sheet": {
                    const uuid = htmlClosest(el, "[data-uuid]")?.dataset.uuid ?? "";
                    const item = await fromUuid(uuid);

                    if (isInstanceOf(item, "ItemPF2e")) {
                        item.sheet.render(true);
                    }

                    break;
                }

                case "reset-uuid": {
                    const input = htmlQueryInClosest(el, ".input", "input");

                    if (input) {
                        input.value = "";
                        this.render();
                    }

                    break;
                }

                case "add-action": {
                    const type = htmlQueryInParent(el, "select")?.value as Maybe<TriggerActionType>;
                    const { trigger, triggers } = getTriggerData(true);
                    if (!trigger || !type) return;

                    const action = createAction(type) as CustomTrigger["actions"][number];
                    if (!action) return;

                    action.showInactives = true;

                    trigger.actions.push(action);
                    this.render(false, { triggers });

                    break;
                }

                case "delete-action": {
                    const index = getActionIndex();
                    const { trigger, triggers } = getTriggerData(true);
                    if (!trigger || index === null) return;

                    const confirm = await confirmDialog(
                        {
                            title: localize("customs.action.delete.label"),
                            content: localize("customs.action.delete.confirm"),
                        },
                        { animation: false }
                    );

                    if (!confirm) return;

                    const nextAction = trigger.actions.at(index + 1);
                    if (nextAction) {
                        nextAction.linked = false;
                    }

                    trigger.actions.splice(index, 1);

                    this.render(false, { triggers });

                    break;
                }

                case "toggle-link": {
                    const { action, triggers } = getActionData(true);
                    if (!action) return;

                    action.linked = !action.linked;
                    this.render(false, { triggers });

                    break;
                }

                case "export-trigger": {
                    const { trigger } = getTriggerData(false);
                    if (!trigger) return;

                    copyData("trigger", trigger);

                    break;
                }

                case "export-action": {
                    const { action } = getActionData(false);
                    if (!action) return;

                    copyData("action", action);

                    break;
                }

                case "export-triggers": {
                    const triggers = this.generateTriggersData(false);
                    if (!triggers) return;

                    copyData("export-all", triggers);

                    break;
                }

                case "import-triggers": {
                    const triggers = this.generateTriggersData(false);
                    if (!triggers) return;

                    new TriggerImporter((entries) => {
                        triggers.push(...entries);
                        this.render(false, { triggers });
                    }).render(true);

                    break;
                }

                case "import-actions": {
                    const { trigger, triggers } = getTriggerData(true);
                    if (!trigger) return;

                    new ActionImporter((entries) => {
                        trigger.actions.push(...entries);
                        this.render(false, { triggers });
                    }).render(true);

                    break;
                }
            }
        });
    }

    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}

function copyData(key: string, data: object) {
    const stringified = JSON.stringify(data, undefined, 2);
    const str = R.isArray(data) ? stringified : `[${stringified}]`;

    game.clipboard.copyPlainText(str);
    info(`customs.${key}.copied`);
}

function processInputEntry(
    inputEntry: TriggerInputEntry,
    usedEntries: Record<string, boolean>,
    values: TriggerInputs,
    prefix: "conditions" | "action-options",
    { path, hidden }: ProcessInputOptions = {}
): { entry: ProcessedInputEntry; value: TriggerInputValueType } {
    const inputValue = values[inputEntry.name];
    const value = isInputType(inputEntry.type, inputValue) ? inputValue : inputEntry.default;
    const required = "required" in inputEntry && !!inputEntry.required;
    const item = inputEntry.type === "uuid" && R.isString(value) ? fromUuidSync(value) : null;
    const localizeOption = "localize" in inputEntry && !!inputEntry;

    const options =
        "options" in inputEntry
            ? arrayToSelect(
                  inputEntry.options,
                  localizeOption || ((value) => localize("select-options", value))
              )
            : [];

    const [min, max, step] = (() => {
        const data = [
            ["min", 0],
            ["max", undefined],
            ["step", 1],
        ] as const;

        if (inputEntry.type !== "number") return data.map(([_, defaultValue]) => defaultValue);

        return R.map(data, ([key, defaultValue]) => {
            const value = Number(inputEntry[key as keyof typeof inputEntry]);
            return isNaN(value) ? defaultValue : value;
        });
    })();

    const entry: ProcessedInputEntry = {
        min,
        max,
        step,
        item,
        path,
        value,
        hidden,
        options,
        required,
        type: inputEntry.type,
        name: inputEntry.name,
        active: required || usedEntries[inputEntry.name],
        label: localize(prefix, inputEntry.name, "label"),
        tooltip:
            inputEntry.type === "uuid"
                ? localize("customs.uuid")
                : localize(prefix, inputEntry.name, "tooltip"),
    };

    return { entry, value };
}

function processInputEntries(
    inputEntries: Readonly<TriggerInputEntry[]>,
    usedEntries: Record<string, boolean>,
    values: TriggerInputs,
    prefix: "conditions" | "action-options",
    options?: ProcessInputOptions
): ProcessedInputEntry[] {
    return R.flatMap(inputEntries, (inputEntry) => {
        const entries: ProcessedInputEntry[] = [];

        const { entry, value } = processInputEntry(
            inputEntry,
            usedEntries,
            values,
            prefix,
            options
        );

        entries.push(entry);

        const subInputs = getSubInputs(inputEntry, value);
        if (subInputs) {
            const subEntries = processInputEntries(subInputs, usedEntries, values, prefix);
            entries.push(...subEntries);
        }

        return entries;
    });
}

type EventAction =
    | "save-triggers"
    | "import-triggers"
    | "export-triggers"
    | "add-trigger"
    | "toggle-entries"
    | "delete-trigger"
    | "open-item-sheet"
    | "reset-uuid"
    | "add-action"
    | "delete-action"
    | "toggle-link"
    | "export-trigger"
    | "export-action"
    | "import-actions";

type ProcessInputOptions = { path?: string; hidden?: boolean };

type CustomDataTrigger = {
    label: string;
    path: string;
    index: number;
    event: TriggerEventType;
    icon: string;
    conditions: ProcessedInputEntry[];
    actions: CustomTriggerAction[];
    showInactives: boolean;
    highlight: boolean;
};

type CustomTriggerAction = {
    entry: TriggerEventAction;
    type: TriggerActionType;
    icon: string;
    index: number;
    label: string;
    path: string;
    linked: boolean;
    showInactives: boolean;
    options: ProcessedInputEntry[];
    linkOption: TriggerInputValueType;
    extraOption?: ProcessedInputEntry;
};

type ProcessedInputEntry = {
    min: number | undefined;
    max: number | undefined;
    step: number | undefined;
    item: ClientDocument | CompendiumIndexData | null;
    value: TriggerInputValueType | undefined;
    options: { value: string; label: string }[];
    required: boolean;
    type: TriggerInputType;
    name: string;
    active: boolean;
    label: string;
    tooltip: string;
    path?: string;
    hidden?: boolean;
};

type CustomTriggersData = FormApplicationData & {
    events: { value: TriggerEventType; label: string }[];
    actions: { value: TriggerActionType; label: string }[];
    leftTriggers: CustomDataTrigger[];
    rightTriggers: CustomDataTrigger[];
    i18n: ReturnType<typeof templateLocalize>;
};

type CustomTrigger = Omit<Trigger, "actions"> & {
    showInactives?: boolean;
    actions: (TriggerAction & { showInactives?: boolean })[];
};

type CustomTriggersRenderOptions = RenderOptions & {
    triggers?: CustomTrigger[];
    highlight?: number[];
};

export { CustomTriggers };
