import {
    addListenerAll,
    arrayToSelect,
    confirmDialog,
    getSetting,
    htmlClosest,
    htmlQueryInClosest,
    htmlQueryInParent,
    isInstanceOf,
    localize,
    R,
    setSetting,
    templateLocalize,
    templatePath,
} from "foundry-pf2e";
import {
    ACTIONS,
    ACTIONS_MAP,
    createAction,
    TriggerAction,
    TriggerActionEntry,
    TriggerActionType,
} from "../action";
import {
    createTrigger,
    EVENTS_MAP,
    isInputType,
    Trigger,
    TriggerEventType,
    TriggerInputEntry,
    TriggerInputType,
    TriggerInputValueType,
} from "../trigger";

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
            width: 740,
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

        this.#actions = arrayToSelect(
            ACTIONS.map((action) => action.type),
            (value) => localize("actions", value)
        );

        // TODO validate triggers
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

        const data: { triggers?: Record<number, TemplateTrigger> } = foundry.utils.expandObject(
            R.mapValues(
                new FormDataExtended(this.form, { disabled: true, readonly }).object,
                (value) => (typeof value === "string" ? value.trim() : value)
            )
        );

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

                const conditions: CustomTriggerCondition[] = R.pipe(
                    event.conditions,
                    R.map((condition): CustomTriggerCondition => {
                        return this.#processInputEntry(
                            condition,
                            trigger.conditions[condition.name],
                            trigger.usedConditions,
                            "conditions"
                        );
                    })
                );

                const actions: CustomTriggerAction[] = R.pipe(
                    trigger.actions,
                    R.map((triggerAction, actionIndex): CustomTriggerAction | undefined => {
                        const action = ACTIONS_MAP.get(triggerAction.type);
                        if (!action) return;

                        const actionPath = `${triggerPath}.actions.${actionIndex}`;
                        const actionOptions = triggerAction.options as Record<
                            string,
                            TriggerInputType | undefined
                        >;

                        const options: CustomTriggerOption[] = R.pipe(
                            action.options,
                            R.map((option): CustomTriggerOption => {
                                const data = this.#processInputEntry(
                                    option,
                                    actionOptions[option.name],
                                    triggerAction.usedOptions,
                                    "action-options"
                                );

                                return {
                                    ...data,
                                    path: `${actionPath}.options`,
                                };
                            }),
                            R.filter(R.isTruthy)
                        );

                        return {
                            options,
                            event: action,
                            type: action.type,
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
                        const previousEvent = previousAction?.event;
                        if (!previousEvent) return;

                        const linkOption = previousEvent.linkOption ?? {
                            name: "valide",
                            type: "checkbox",
                            default: true,
                        };

                        if (
                            action.linkOption !== undefined &&
                            !isInputType(linkOption.type, action.linkOption)
                        )
                            return;

                        const data = this.#processInputEntry(
                            linkOption,
                            action.linkOption,
                            {},
                            "action-options"
                        );

                        action.extraOption = {
                            ...data,
                            hidden: !previousEvent.linkOption,
                            path: `${action.path}.linkOption`,
                        };
                    })
                );

                return {
                    path: triggerPath,
                    index: triggerIndex,
                    event: trigger.event,
                    icon: event.icon,
                    label: event.createLabel(trigger),
                    conditions,
                    actions,
                    highlight: highlights.includes(triggerIndex),
                    showInactives: !!trigger.showInactives,
                };
            }),
            R.filter(R.isTruthy)
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

        addListenerAll(html, ".input input", "change", (event, el) => {
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
            const action = el.dataset.action as EventAction;

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

            switch (action) {
                case "add-trigger": {
                    const type = htmlQueryInParent(el, "select")?.value as Maybe<TriggerEventType>;
                    if (!type) return;

                    const triggers = this.generateTriggersData(false);
                    const event = EVENTS_MAP.get(type);
                    if (!event) return;

                    const trigger = createTrigger(type) as CustomTrigger;

                    trigger.showInactives = true;
                    triggers.unshift(trigger);

                    this.render(false, { triggers, highlight: [0] });

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
                    const index = getActionIndex();
                    const { trigger, triggers } = getTriggerData(true);
                    if (!trigger || index === null) return;

                    const action = trigger.actions.at(index);
                    if (!action) return;

                    action.linked = !action.linked;
                    this.render(false, { triggers });

                    break;
                }
            }
        });
    }

    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }

    #processInputEntry(
        inputEntry: TriggerInputEntry,
        inputValue: TriggerInputValueType,
        usedEntries: Record<string, boolean>,
        source: "conditions" | "action-options"
    ): ProcessedInputEntry {
        const required = "required" in inputEntry && !!inputEntry.required;
        const item =
            inputEntry.type === "uuid" && R.isString(inputValue) ? fromUuidSync(inputValue) : null;

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

        const value = isInputType(inputEntry.type, inputValue) ? inputValue : inputEntry.default;

        return {
            min,
            max,
            step,
            item,
            value,
            options,
            required,
            type: inputEntry.type,
            name: inputEntry.name,
            active: required || usedEntries[inputEntry.name],
            label: localize(source, inputEntry.name, "label"),
            tooltip: localize(source, inputEntry.name, "tooltip"),
        };
    }
}

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
};

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
    | "toggle-link";

type CustomDataTrigger = {
    label: string;
    path: string;
    index: number;
    event: TriggerEventType;
    icon: string;
    conditions: CustomTriggerCondition[];
    actions: CustomTriggerAction[];
    showInactives: boolean;
    highlight: boolean;
};

type CustomTriggerOption = CustomTriggerInput & {
    path: string;
};

type CustomTriggerAction = {
    event: TriggerActionEntry;
    type: TriggerActionType;
    icon: string;
    index: number;
    label: string;
    path: string;
    linked: boolean;
    showInactives: boolean;
    options: CustomTriggerOption[];
    linkOption: TriggerInputValueType;
    extraOption?: CustomTriggerOption & { hidden: boolean };
};

type CustomTriggerInput = {
    required: boolean;
    label: string;
    type: TriggerInputType;
    name: string;
    active: boolean;
    value: TriggerInputValueType | undefined;
    tooltip: string;
    item: Maybe<ClientDocument | CompendiumIndexData>;
};

type CustomTriggerCondition = CustomTriggerInput & {
    options: { value: string; label: string }[];
};

type CustomTriggersData = {
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
