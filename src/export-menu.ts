import { Blueprint } from "blueprint/blueprint";
import { serializeTrigger } from "data/data-trigger";
import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    TemplateLocalize,
    addListener,
    addListenerAll,
    confirmDialog,
    htmlQuery,
    htmlQueryAll,
    info,
    localize,
    render,
    templateLocalize,
} from "module-helpers";

class TriggersExportMenu extends foundry.applications.api.ApplicationV2 {
    #blueprint: Blueprint;
    #triggers: { triggers: ExportTrigger[]; subtriggers: ExportTrigger[] };

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        id: "pf2e-trigger-export-menu",
        window: {
            positioned: true,
        },
        position: {
            width: 500,
        },
    };

    constructor(blueprint: Blueprint, options: DeepPartial<ApplicationConfiguration> = {}) {
        options.window ??= {};
        options.window.title = localize("export-all.title");

        super(options);

        this.#blueprint = blueprint;

        const [triggers, subtriggers] = R.pipe(
            this.#blueprint.triggers,
            R.map((trigger): ExportTrigger => {
                const subs = trigger.isSub
                    ? undefined
                    : R.pipe(
                          R.values(trigger.nodes),
                          R.map((node) => node.subId),
                          R.filter(R.isTruthy)
                      );

                return {
                    id: trigger.id,
                    name: trigger.name,
                    selected: true,
                    subs,
                    data: trigger,
                };
            }),
            R.partition((trigger) => !!trigger.subs)
        );

        this.#triggers = { triggers, subtriggers };
    }

    protected async _prepareContext(options: ApplicationRenderOptions): Promise<TriggerExportData> {
        return {
            ...this.#triggers,
            i18n: templateLocalize("export-all"),
        };
    }

    protected _renderHTML(
        context: TriggerExportData,
        options: ApplicationRenderOptions
    ): Promise<string> {
        return render("export-menu", context);
    }

    protected _replaceHTML(
        result: string,
        content: HTMLElement,
        options: ApplicationRenderOptions
    ): void {
        content.innerHTML = result;
        this.#activateListeners(content);
    }

    async #onTriggerSelect(trigger: ExportTrigger) {
        const subtriggers: ExportTrigger[] = R.pipe(
            trigger.subs ?? [],
            R.map((id) => {
                return this.#triggers.subtriggers.find((subtrigger) => subtrigger.id === id);
            }),
            R.filter((subtrigger): subtrigger is ExportTrigger => {
                return (
                    !!subtrigger &&
                    subtrigger.selected !== trigger.selected &&
                    (trigger.selected ||
                        !this.#triggers.triggers.some((trigger) => {
                            return trigger.selected && trigger.subs?.includes(subtrigger.id);
                        }))
                );
            })
        );

        if (!subtriggers.length) return;

        const localizeKey = trigger.selected ? "unselected" : "selected";
        const result = await confirmDialog(
            {
                title: localize(`export-all.triggers.${localizeKey}.title`),
                content: localize(`export-all.triggers.${localizeKey}.content`, trigger),
            },
            { animation: false }
        );

        if (!result) return;

        for (const subtrigger of subtriggers) {
            subtrigger.selected = trigger.selected;

            const input = htmlQuery<HTMLInputElement>(
                this.element,
                `.subtriggers li input[data-id="${subtrigger.id}"]`
            );

            if (input) {
                input.checked = trigger.selected;
            }
        }
    }

    async #onSubtriggerSelect(subtrigger: ExportTrigger) {
        if (subtrigger.selected) return;

        const triggers = this.#triggers.triggers.filter(
            (trigger) => trigger.selected && !!trigger.subs?.includes(subtrigger.id)
        );

        if (!triggers.length) return;

        const result = await confirmDialog(
            {
                title: localize("export-all.subtriggers.selected.title"),
                content: localize("export-all.subtriggers.selected.content", subtrigger),
            },
            { animation: false }
        );

        if (!result) return;

        for (const trigger of triggers) {
            trigger.selected = subtrigger.selected;

            const input = htmlQuery<HTMLInputElement>(
                this.element,
                `.triggers li input[data-id="${trigger.id}"]`
            );

            if (input) {
                input.checked = subtrigger.selected;
            }
        }

        for (const trigger of triggers) {
            this.#onTriggerSelect(trigger);
        }
    }

    #activateListeners(html: HTMLElement) {
        addListenerAll(html, "[name='selected']", "change", async (event, el: HTMLInputElement) => {
            const { id, type } = el.dataset as EventData;

            const trigger = this.#triggers[type].find((trigger) => trigger.id === id);
            if (!trigger) return;

            trigger.selected = el.checked;

            if (type === "triggers") {
                this.#onTriggerSelect(trigger);
            } else {
                this.#onSubtriggerSelect(trigger);
            }
        });

        addListenerAll(html, "[data-action='toggle-all']", (event, el) => {
            const { type } = el.dataset as EventData;
            const inputs = htmlQueryAll<HTMLInputElement>(html, `.${type} li input`);
            const checked = inputs.some((el) => !el.checked);

            for (const input of inputs) {
                input.checked = checked;
            }

            for (const trigger of this.#triggers[type]) {
                trigger.selected = checked;
            }
        });

        addListener(html, "[data-action='export']", () => {
            const serialized = R.pipe(
                [...this.#triggers.triggers, ...this.#triggers.subtriggers],
                R.filter((trigger) => trigger.selected),
                R.map((trigger) => serializeTrigger(trigger.data, true))
            );

            const stringified = JSON.stringify(serialized);

            game.clipboard.copyPlainText(stringified);
            info("export-all.confirm");
        });
    }
}

type EventData = {
    id: string;
    type: "triggers" | "subtriggers";
};

type TriggerExportData = {
    triggers: ExportTrigger[];
    subtriggers: ExportTrigger[];
    i18n: TemplateLocalize;
};

type ExportTrigger = {
    name: string;
    id: string;
    selected: boolean;
    subs?: string[];
    data: TriggerData;
};

export { TriggersExportMenu };
