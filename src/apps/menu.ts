import {
    R,
    addListenerAll,
    confirmDialog,
    createFormData,
    htmlClosest,
    htmlQueryInClosest,
    htmlQueryInParent,
    indexObjToArray,
    isInstanceOf,
    localize,
    setSetting,
    templateLocalize,
    templatePath,
} from "module-helpers";
import {
    TriggerAction,
    createNewAction,
    getActionEntries,
    getActionEntry,
    getActionLabel,
} from "../actions";
import {
    TriggerCondition,
    createNewCondition,
    getConditionEntries,
    getConditionEntry,
    getConditionLabel,
} from "../conditions";
import { getEventEntries, getEventEntry, getEventLabel } from "../events";
import {
    TriggerInputType,
    TriggerInputValueType,
    getDefaultInputValue,
    getInputData,
    getInputLabel,
} from "../inputs";
import { Trigger, createNewTrigger, getTriggers } from "../trigger";

class TriggersMenu extends FormApplication {
    #triggers: DeepPartial<Trigger>[];
    #highlight: number[] = [];

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "pf2e-trigger-menu",
            title: localize("menu.title"),
            template: templatePath("menu"),
            width: 900,
            submitOnChange: false,
            submitOnClose: false,
            closeOnSubmit: true,
            scrollY: [".triggers"],
        });
    }

    constructor(object?: any, options?: Partial<FormApplicationOptions>) {
        super(object, options);

        this.#triggers = getTriggers(true);
    }

    getData(options?: Partial<FormApplicationOptions>): TriggersMenuData {
        const highlights = this.#highlight.slice();

        const targets = {
            target: localize("menu.target"),
            source: localize("menu.source"),
        };

        const actionsSelect = entriesToOptions("action", getActionEntries());

        const triggers = R.pipe(
            this.#triggers,
            R.map((trigger, triggerIndex): TriggerData | undefined => {
                if (!R.isString(trigger.id) || !R.isString(trigger.event)) return;

                const eventEntry = getEventEntry(trigger.event);
                if (!eventEntry) return;

                const triggerPath = `triggers.${triggerIndex}`;
                const uniqueConditions: Set<string> = new Set();
                const hasSource = triggerHasSource(trigger);

                const requiredConditions = R.pipe(
                    eventEntry.conditions,
                    R.map((conditionEntry): TriggerDataCondition => {
                        const key = conditionEntry.key;

                        if (conditionEntry.unique) {
                            uniqueConditions.add(key);
                        }

                        const condition = trigger.requiredConditions?.[key] ?? {};
                        const value = condition.value ?? getDefaultInputValue(conditionEntry);

                        return {
                            ...getInputData(conditionEntry, value, "condition"),
                            id: condition.id ?? foundry.utils.randomID(),
                            key,
                            value,
                            type: conditionEntry.type,
                            isSource: !!conditionEntry.allowSource && !!condition.isSource,
                            isOptional: false,
                            path: `${triggerPath}.requiredConditions.${key}`,
                            label: getConditionLabel(condition, conditionEntry, hasSource),
                        };
                    })
                );

                const optionalConditions = R.pipe(
                    (trigger.optionalConditions ?? []) as Partial<TriggerCondition>[],
                    R.map(
                        (
                            { id, isSource, key, value },
                            conditionIndex
                        ): TriggerDataCondition | undefined => {
                            if (!R.isString(key) || !R.isString(id)) return;
                            if (isSource && !hasSource) return;

                            const conditionEntry = getConditionEntry(key);
                            if (!conditionEntry) return;

                            if (conditionEntry.unique) {
                                uniqueConditions.add(key);
                            }

                            return {
                                ...conditionEntry,
                                ...getInputData(conditionEntry, value, "condition"),
                                id,
                                isOptional: true,
                                path: `${triggerPath}.optionalConditions.${conditionIndex}`,
                                label: getConditionLabel({ isSource }, conditionEntry, hasSource),
                                isSource: !!conditionEntry.allowSource && !!isSource,
                                value: value ?? getDefaultInputValue(conditionEntry),
                            };
                        }
                    ),
                    R.filter(R.isTruthy)
                );

                const actions = R.pipe(
                    (trigger.actions ?? []) as Partial<TriggerAction>[],
                    R.map((action, actionIndex): TriggerDataAction | undefined => {
                        if (!R.isString(action.key) || !R.isString(action.id)) return;

                        const actionEntry = getActionEntry(action.key);
                        if (!actionEntry) return;

                        const nextAction = trigger.actions?.at(actionIndex + 1);
                        const linkedToNext = !!nextAction?.linked;
                        const actionPath = `${triggerPath}.actions.${actionIndex}`;

                        const allOptions = R.pipe(
                            actionEntry.options,
                            R.map((optionEntry): TriggerDataOption | undefined => {
                                if (
                                    (optionEntry.ifHasSource === true && !hasSource) ||
                                    (optionEntry.ifHasSource === false && hasSource) ||
                                    (!linkedToNext && optionEntry.ifLinked)
                                )
                                    return;

                                const isOptional = !!optionEntry.optional;
                                const optionValue = action.options?.[optionEntry.key];
                                const value = optionValue ?? getDefaultInputValue(optionEntry);

                                return {
                                    ...getInputData(
                                        optionEntry,
                                        value,
                                        "action",
                                        actionEntry.key,
                                        "option"
                                    ),
                                    key: optionEntry.key,
                                    type: optionEntry.type,
                                    value,
                                    isOptional,
                                    label: getInputLabel(
                                        optionEntry,
                                        "action",
                                        actionEntry.key,
                                        "option"
                                    ),
                                    linkOption: !!optionEntry.ifLinked,
                                    active: !isOptional || !!optionValue,
                                    path: `${actionPath}.options.${optionEntry.key}`,
                                };
                            }),
                            R.filter(R.isTruthy)
                        );

                        const [linkOptions, options] = R.partition(
                            allOptions,
                            (option) => option.linkOption
                        );

                        const linked = actionIndex > 0 && !!action.linked;
                        const endOfChain = linked && !linkedToNext && !!nextAction;

                        return {
                            id: action.id,
                            key: action.key,
                            options,
                            linked,
                            linkOptions,
                            icon: actionEntry.icon,
                            label: getActionLabel(action.key),
                            path: actionPath,
                            endOfChain,
                            endProcess: !!action.endProcess,
                        };
                    }),
                    R.filter(R.isTruthy)
                );

                const conditionsSelect = R.pipe(
                    getConditionEntries(),
                    R.flatMap((condition) => {
                        if (uniqueConditions.has(condition.key)) return;

                        const rawLabel = localize("condition", condition.key, "label");

                        if (hasSource && condition.allowSource) {
                            return (["target", "source"] as const).map((x) => {
                                return {
                                    value: `${condition.key}.${x}`,
                                    label: `${targets[x]}: ${rawLabel}`,
                                };
                            });
                        }

                        return [
                            {
                                value: condition.key,
                                label: rawLabel,
                            },
                        ];
                    }),
                    R.filter(R.isTruthy),
                    R.sortBy(R.prop("label"))
                );

                return {
                    id: trigger.id,
                    event: trigger.event,
                    icon: eventEntry.icon,
                    path: triggerPath,
                    actions,
                    conditions: [...requiredConditions, ...optionalConditions],
                    conditionsSelect,
                    actionsSelect,
                    label: getEventLabel(eventEntry, trigger as Trigger),
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
            events: entriesToOptions("event", getEventEntries()),
            leftTriggers,
            rightTriggers,
            i18n: templateLocalize("menu"),
        };
    }

    render(force?: boolean, options?: TriggersMenuRenderOptions): this {
        if (this.rendered) {
            this.#triggers = options?.triggers ?? this.generateTriggersData(true);
            this.#highlight = options?.highlight ?? [];
        }

        return super.render(force, options);
    }

    generateTriggersData(readonly: boolean = false): Trigger[] {
        const data: { triggers?: TriggerFormData[] } = createFormData(this.form, {
            disabled: true,
            readonly,
            expand: true,
        });

        return R.pipe(
            indexObjToArray(data.triggers),
            R.map(({ event, id, actions, optionalConditions, requiredConditions }): Trigger => {
                const processedActions = indexObjToArray(actions).map((action) => {
                    const options: Record<string, TriggerInputValueType> = {};

                    for (const [key, { value, active }] of R.entries(action.options)) {
                        if (!active) continue;
                        options[key] = value;
                    }

                    return {
                        ...action,
                        options,
                    };
                });

                return {
                    id,
                    event,
                    requiredConditions: requiredConditions ?? {},
                    optionalConditions: indexObjToArray(optionalConditions),
                    actions: processedActions,
                };
            })
        );
    }

    activateListeners($html: JQuery<HTMLElement>): void {
        const html = this.element[0];

        const getTriggerData = (el: HTMLElement, splice?: boolean) => {
            const triggerId = htmlClosest(el, "[data-trigger-id]")?.dataset.triggerId;
            const triggers = this.generateTriggersData(false);
            const trigger =
                triggers[splice ? "findSplice" : "find"]((x) => x.id === triggerId) ?? undefined;

            return { trigger, triggers };
        };

        const getActionData = (el: HTMLElement, splice?: boolean) => {
            const { trigger, triggers } = getTriggerData(el);
            const actionId = htmlClosest(el, "[data-action-id]")?.dataset.actionId;
            const actionIndex =
                trigger?.actions?.findIndex((action) => action.id === actionId) ?? -1;
            const action = trigger?.actions[actionIndex];

            return {
                trigger,
                triggers,
                action,
                actionIndex,
            };
        };

        const confirmDelete = (key: "trigger" | "condition" | "action") => {
            return confirmDialog(
                {
                    title: localize(`menu.${key}.delete.title`),
                    content: localize(`menu.${key}.delete.prompt`),
                },
                { animation: false }
            );
        };

        addListenerAll(html, "[data-action]", async (event, el) => {
            switch (el.dataset.action as EventAction) {
                case "save-triggers": {
                    const data = this.generateTriggersData(false);
                    await setSetting("triggers", data);
                    return this.close();
                }

                case "add-trigger": {
                    const select = htmlQueryInParent(el, "select");
                    const event = select?.value;
                    if (!event) return;

                    const trigger = createNewTrigger(event);
                    if (!trigger) return;

                    const triggers = this.generateTriggersData(false);

                    triggers.push(trigger);

                    return this.render(false, { triggers, highlight: [triggers.length - 1] });
                }

                case "delete-trigger": {
                    if (!(await confirmDelete("trigger"))) return;

                    const { trigger, triggers } = getTriggerData(el, true);
                    if (!trigger) return;

                    this.render(false, { triggers });

                    return trigger && this.render(false, { triggers });
                }

                case "add-condition": {
                    const { trigger, triggers } = getTriggerData(el);
                    const [type, source] = htmlQueryInParent(el, "select")?.value.split(".") ?? [];
                    if (!trigger || !type) return;

                    const condition = createNewCondition(type as string, source === "source");
                    if (!condition) return;

                    trigger.optionalConditions ??= [];
                    trigger.optionalConditions.push(condition);

                    return this.render(false, { triggers });
                }

                case "delete-condition": {
                    const conditionId = htmlClosest(el, "[data-condition-id]")?.dataset.conditionId;
                    if (!conditionId || !(await confirmDelete("condition"))) return;

                    const { trigger, triggers } = getTriggerData(el);
                    if (!trigger) return;

                    const condition = trigger.optionalConditions?.findSplice(
                        (condition) => condition.id === conditionId
                    );

                    return condition && this.render(false, { triggers });
                }

                case "add-action": {
                    const { trigger, triggers } = getTriggerData(el);
                    const type = htmlQueryInParent(el, "select")?.value;
                    if (!trigger || !type) return;

                    const action = createNewAction(type);
                    if (!action) return;

                    trigger.actions ??= [];
                    trigger.actions.push(action);

                    return this.render(false, { triggers });
                }

                case "delete-action": {
                    const { trigger, triggers, actionIndex } = getActionData(el);
                    if (!trigger || actionIndex === -1 || !(await confirmDelete("action"))) return;

                    const nextAction = trigger.actions.at(actionIndex + 1);
                    if (nextAction) nextAction.linked = false;

                    trigger.actions.splice(actionIndex, 1);

                    return this.render(false, { triggers });
                }

                case "link-action": {
                    const linked = el.dataset.linked === "true";
                    const { trigger, triggers, action } = getActionData(el);
                    if (!trigger || !action) return;

                    action.linked = linked;

                    return this.render(false, { triggers });
                }

                case "move-action": {
                    const direction = Number(el.dataset.direction) as 1 | -1;
                    const { trigger, triggers, action, actionIndex } = getActionData(el);
                    if (!direction || !trigger || !action) return;

                    const actions = trigger.actions;
                    const newIndex = Math.clamp(actionIndex + direction, 0, actions.length - 1);
                    if (newIndex === actionIndex) return;

                    action.linked = false;

                    const nextAction = actions.at(actionIndex + 1);
                    if (nextAction) nextAction.linked = false;

                    if (newIndex < actionIndex) {
                        const previousAction = actions.at(actionIndex - 1);
                        if (previousAction) previousAction.linked = false;
                    } else {
                        const nextNextAction = actions.at(actionIndex + 2);
                        if (nextNextAction) nextNextAction.linked = false;
                    }

                    trigger.actions = R.swapIndices(actions, actionIndex, newIndex);

                    return this.render(false, { triggers });
                }

                case "toggle-end-chain": {
                    const { triggers, action } = getActionData(el);
                    if (!action) return;

                    action.endProcess = !action.endProcess;

                    return this.render(false, { triggers });
                }

                case "open-item-sheet": {
                    const uuid = htmlClosest(el, "[data-uuid]")?.dataset.uuid ?? "";
                    const item = await fromUuid(uuid);

                    return isInstanceOf(item, "ItemPF2e") && item.sheet.render(true);
                }

                case "reset-uuid": {
                    const input = htmlQueryInClosest(el, ".input", "input");
                    if (input) {
                        input.value = "";
                        this.render();
                    }
                    return;
                }
            }
        });

        addListenerAll(
            html,
            ".input input[type='text'], .input input[type='number']",
            "keydown",
            (event, el) => {
                if (event.key === "Enter") {
                    el.blur();
                }
            }
        );

        const activeToggle = (el: HTMLElement) => {
            const activeToggle = htmlQueryInClosest<HTMLInputElement>(el, ".group", ".active");
            if (activeToggle) {
                activeToggle.checked = true;
            }
        };

        addListenerAll(
            html,
            ".input input, .input select",
            "change",
            (event, el: HTMLInputElement) => {
                const item = fromUuidSync(el.value);
                if (item) {
                    activeToggle(el);
                }

                this.render();
            }
        );

        addListenerAll(html, ".uuid .input input", "drop", (event, el: HTMLInputElement) => {
            const data = TextEditor.getDragEventData(event);
            if (data.type !== "Item" || !R.isString(data.uuid)) return;

            el.value = data.uuid;
            activeToggle(el);

            this.render();
        });
    }

    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}

function entriesToOptions<K extends string>(
    path: "event" | "condition" | "action",
    entries: ReadonlyArray<{ key: K }>
) {
    return R.pipe(
        entries,
        R.map((entry) => entryToOption(path, entry)),
        R.sortBy(R.prop("label"))
    );
}

function entryToOption<K extends string>(
    path: "event" | "condition" | "action",
    entry: Readonly<{ key: K }>
) {
    return { value: entry.key, label: localize(path, entry.key, "label") };
}

function triggerHasSource(trigger: DeepPartial<Trigger>) {
    return [
        ...R.values(trigger.requiredConditions ?? {}),
        ...(trigger.optionalConditions ?? []),
    ].some((condition) => typeof getConditionEntry(condition?.key ?? "")?.sources === "function");
}

type EventAction =
    | "add-trigger"
    | "add-condition"
    | "add-action"
    | "delete-trigger"
    | "delete-condition"
    | "delete-action"
    | "link-action"
    | "move-action"
    | "toggle-end-chain"
    | "save-triggers"
    | "open-item-sheet"
    | "reset-uuid";

type TriggersMenuRenderOptions = RenderOptions & {
    triggers?: Trigger[];
    highlight?: number[];
};

type TriggersMenuData = FormApplicationData & {
    leftTriggers: TriggerData[];
    rightTriggers: TriggerData[];
    i18n: ReturnType<typeof templateLocalize>;
    events: { value: string; label: string }[];
};

type TriggerFormData = {
    id: string;
    event: string;
    requiredConditions?: Record<string, TriggerCondition>;
    optionalConditions?: TriggerCondition[] | Record<string, TriggerCondition>;
    actions?: TriggerFormDataAction[];
};

type TriggerFormDataAction = Omit<TriggerAction, "options"> & {
    options: Record<string, TriggerFormActionOption>;
};

type TriggerFormActionOption = {
    value: TriggerInputValueType;
    active: boolean;
};

type TriggerData = {
    id: string;
    event: string;
    icon: string;
    label: string;
    path: string;
    conditions: TriggerDataCondition[];
    actions: TriggerDataAction[];
    conditionsSelect: {
        value: string;
        label: string;
    }[];
    actionsSelect: {
        value: string;
        label: string;
    }[];
};

type TriggerDataEntry = {
    key: string;
    label: string;
    path: string;
};

type TriggerDataInput = TriggerDataEntry & {
    placeholder: string;
    isOptional: boolean;
    type: TriggerInputType;
    value: TriggerInputValueType;
    item: ClientDocument | CompendiumIndexData | null;
    options: { value: string; label: string }[] | null;
};

type TriggerDataOption = TriggerDataInput & {
    active: boolean;
    linkOption: boolean;
};

type TriggerDataAction = TriggerDataEntry & {
    id: string;
    icon: string;
    options: TriggerDataOption[];
    linked: boolean;
    linkOptions: TriggerDataOption[] | undefined;
    endOfChain: boolean;
    endProcess: boolean;
};

type TriggerDataCondition = TriggerDataInput & {
    id: string;
    isSource: boolean;
};

export { TriggersMenu };
