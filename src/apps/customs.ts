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
import { ACTIONS, ACTIONS_MAP, TriggerActions, TriggerActionType } from "../action";
import {
    createTrigger,
    EVENTS_MAP,
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
        }

        return super.render(force, options);
    }

    generateTriggersData(readonly: boolean = false) {
        const data: Record<number, CustomTrigger> & { "action-type"?: string | string[] } =
            foundry.utils.expandObject(
                R.mapValues(
                    new FormDataExtended(this.form, { disabled: true, readonly }).object,
                    (value) => (typeof value === "string" ? value.trim() : value)
                )
            );

        delete data["action-type"];

        return R.pipe(
            R.entries(data as Record<number, CustomTrigger>),
            R.sortBy(([index]) => Number(index)),
            R.map(([_, trigger]) => {
                trigger.actions ??= {};
                return trigger;
            })
        );
    }

    getData(options?: Partial<FormApplicationOptions>): CustomTriggersData {
        const leftTriggers: CustomDataTrigger[] = [];
        const rightTriggers: CustomDataTrigger[] = [];

        const triggers = R.pipe(
            this.#triggers,
            R.map((trigger, index): CustomDataTrigger | undefined => {
                const event = EVENTS_MAP.get(trigger.event);
                if (!event) return;

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
                    R.entries(trigger.actions),
                    R.map(([actionType, triggerAction]): CustomTriggerAction | undefined => {
                        const action = ACTIONS_MAP.get(actionType);
                        if (!action) return;

                        const options: CustomTriggerOption[] = R.pipe(
                            R.entries(triggerAction),
                            R.map(([name, value]): CustomTriggerOption | undefined => {
                                const option = action.options.find((o) => o.name === name);
                                if (!option) return;

                                return this.#processInputEntry(
                                    option,
                                    value as TriggerInputValueType,
                                    triggerAction.usedOptions,
                                    "action-options"
                                );
                            }),
                            R.filter(R.isTruthy)
                        );

                        return {
                            options,
                            type: action.type,
                            icon: action.icon,
                            linked: !!triggerAction.linked,
                            label: localize("actions", action.type),
                            showInactives: !!triggerAction.showInactives,
                        };
                    }),
                    R.filter(R.isTruthy)
                );

                return {
                    index,
                    event: event.id,
                    icon: event.icon,
                    label: event.createLabel(trigger),
                    conditions,
                    actions,
                    showInactives: !!trigger.showInactives,
                };
            }),
            R.filter(R.isTruthy)
        );

        for (let index = 0; index < triggers.length; index++) {
            const trigger = triggers[index];
            const array = index % 2 === 0 ? leftTriggers : rightTriggers;
            array.push(trigger);
        }

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

            switch (action) {
                case "add-trigger": {
                    const typeSelect = htmlQueryInParent<HTMLSelectElement>(
                        el,
                        "[name='trigger-type']"
                    );
                    if (!typeSelect) return;

                    const type = typeSelect.value as TriggerEventType;
                    const triggers = this.generateTriggersData(false);
                    const event = EVENTS_MAP.get(type);
                    if (!event) return;

                    const trigger = createTrigger(type) as CustomTrigger;

                    trigger.showInactives = true;
                    triggers.unshift(trigger);

                    this.render(false, { triggers });

                    break;
                }

                case "delete-trigger": {
                    const index = Number(htmlClosest(el, "[data-index]")?.dataset.index);
                    if (isNaN(index)) return;

                    const confirm = await confirmDialog({
                        title: localize("customs.trigger.delete.label"),
                        content: localize("customs.trigger.delete.confirm"),
                    });

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
            }
        });
    }

    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }

    #processInputEntry(
        inputEntry: TriggerInputEntry,
        value: TriggerInputValueType | undefined,
        usedEntries: Record<string, boolean>,
        source: "conditions" | "action-options"
    ) {
        const required = "required" in inputEntry && !!inputEntry.required;
        const item = inputEntry.type === "uuid" && R.isString(value) ? fromUuidSync(value) : null;

        const options =
            "options" in inputEntry
                ? arrayToSelect(inputEntry.options, (value) => localize("condition-options", value))
                : [];

        return {
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

type EventAction =
    | "save-triggers"
    | "import-triggers"
    | "export-triggers"
    | "add-trigger"
    | "toggle-entries"
    | "delete-trigger"
    | "open-item-sheet"
    | "reset-uuid";

type CustomDataTrigger = {
    label: string;
    index: number;
    event: TriggerEventType;
    icon: string;
    conditions: CustomTriggerCondition[];
    actions: CustomTriggerAction[];
    showInactives: boolean;
};

type CustomTriggerOption = CustomTriggerInput;

type CustomTriggerAction = {
    type: TriggerActionType;
    icon: string;
    label: string;
    linked: boolean;
    showInactives: boolean;
    options: CustomTriggerOption[];
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
    actions: TriggerActions extends { [t in infer TType extends TriggerActionType]: any }
        ? {
              [k in TType]?: TriggerActions[k] & {
                  showInactives?: boolean;
              };
          }
        : never;
};

type CustomTriggersRenderOptions = RenderOptions & {
    triggers: CustomTrigger[];
};

export { CustomTriggers };
