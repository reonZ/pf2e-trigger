import { Blueprint } from "blueprint/blueprint";
import { processTriggers } from "data/data-trigger-list";
import { openTriggerDialog } from "helpers/helpers-trigger-dialog";
import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    TemplateLocalize,
    addListener,
    addListenerAll,
    confirmDialog,
    createHTMLElement,
    error,
    htmlClosest,
    htmlQuery,
    htmlQueryAll,
    localize,
    render,
    templateLocalize,
    waitDialog,
} from "module-helpers";

class TriggersMenu extends foundry.applications.api.ApplicationV2 {
    #blueprint: Blueprint;
    #timeout: NodeJS.Timeout | null = null;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        window: {
            resizable: false,
            minimizable: false,
            frame: false,
            positioned: false,
        },
        id: "pf2e-trigger-triggers-menu",
        classes: ["app", "window-app"],
    };

    constructor(options?: DeepPartial<ApplicationConfiguration>) {
        super(options);

        this.#blueprint = new Blueprint(this);
    }

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get sidebar(): HTMLElement | null {
        return htmlQuery(this.element, ".sidebar");
    }

    async render(
        options?: boolean | DeepPartial<ApplicationRenderOptions>,
        _options?: DeepPartial<ApplicationRenderOptions>
    ): Promise<this> {
        if (this.rendered) return this;
        return super.render(options, _options);
    }

    async close(options?: ApplicationClosingOptions) {
        return super.close({ animate: false });
    }

    _onClose() {
        this.blueprint?.destroy();
    }

    protected async _prepareContext(options?: ApplicationRenderOptions): Promise<TriggersMenuData> {
        const allTriggers = this.blueprint.triggersList ?? [];
        const [triggers, subtriggers] = R.partition(allTriggers, (trigger) => !trigger.sub);

        return {
            triggers,
            subtriggers,
            selected: this.blueprint.trigger?.id,
            i18n: templateLocalize("triggers-menu"),
        };
    }

    protected _renderHTML(context: object, options: ApplicationRenderOptions): Promise<string> {
        return render("triggers-menu", context);
    }

    protected _replaceHTML(
        result: string,
        content: HTMLElement,
        options: ApplicationRenderOptions
    ): void {
        content.innerHTML = result;
        this.#activateListeners(content);
    }

    _onFirstRender(context: TriggersMenuData, options: ApplicationRenderOptions) {
        requestAnimationFrame(() => {
            this.blueprint.initialize();
            this.refresh();
        });
    }

    async refresh(close?: boolean) {
        const data = await this._prepareContext();
        const template = await render("triggers-menu", data);
        const wrapper = createHTMLElement("div", { innerHTML: template });

        const oldTitle = htmlQuery(this.element, ".trigger-title");
        if (oldTitle) {
            oldTitle.innerText = this.blueprint.trigger?.name ?? "";
        }

        const newTriggers = htmlQueryAll(wrapper, "ul.triggers");
        const oldTriggers = htmlQueryAll(this.sidebar, "ul.triggers");

        if (newTriggers.length && newTriggers.length === oldTriggers.length) {
            oldTriggers[0].replaceWith(newTriggers[0]);
            oldTriggers[1].replaceWith(newTriggers[1]);

            this.#activateTriggersListeners(this.element);
        }

        if (close) {
            this.closeSidebar();
        }
    }

    closeSidebar() {
        requestAnimationFrame(() => {
            this.sidebar?.classList.remove("show");
        });
    }

    async #closeAndSave() {
        const result = await confirmDialog(
            {
                title: localize("triggers-menu.save.title"),
                content: localize("triggers-menu.save.prompt"),
            },
            { animation: false }
        );

        if (result) {
            this.blueprint.saveTriggers();
        }

        this.close();
    }

    async #deleteTrigger(id: string) {
        const trigger = this.blueprint.getTrigger(id);
        if (!trigger) return;

        const result = await confirmDialog(
            {
                title: localize("triggers-menu.trigger.delete.title"),
                content: localize("triggers-menu.trigger.delete.prompt", trigger),
            },
            { animation: false }
        );

        if (!result) return;

        const isCurrent = this.blueprint.trigger?.id === id;

        this.blueprint.deleteTrigger(id);
        this.refresh(isCurrent);
    }

    async #addTrigger() {
        const result = await openTriggerDialog("add");
        if (!result) return;

        this.blueprint.createTrigger(result);
        this.refresh(true);
    }

    async #addSubtrigger() {
        const result = await openTriggerDialog("add-sub");
        if (!result) return;

        this.blueprint.createTrigger(result);
        this.refresh(true);
    }

    async #editTrigger(id: string) {
        const trigger = this.blueprint.getTrigger(id);
        if (!trigger) return;

        const result = await openTriggerDialog("edit", trigger);
        if (!result || result.name === trigger.name) return;

        trigger.name = result.name;
        this.refresh();
    }

    async #import() {
        const result = await waitDialog({
            title: localize("import.title"),
            content: "<textarea></textarea>",
            yes: {
                label: localize("import.yes"),
                icon: "fa-solid fa-file-import",
                callback: async (event, btn, html) => {
                    return htmlQuery(html, "textarea")?.value;
                },
            },
            no: {
                label: localize("import.no"),
            },
        });

        if (!result) return;

        try {
            const data = JSON.parse(result as any);

            if (!R.isArray(data)) {
                throw new Error();
            }

            const validated = processTriggers(data as any);

            this.blueprint.addTriggers(validated);
            this.refresh();
        } catch {
            error("import.error");
        }
    }

    #activateListeners(html: HTMLElement) {
        addListener(html, ".sidebar", "pointerenter", (event, el) => {
            if (this.#timeout) {
                clearTimeout(this.#timeout);
                this.#timeout = null;
            }
            el.classList.add("show");
        });

        addListener(html, ".sidebar", "pointerleave", (event, el) => {
            this.#timeout = setTimeout(() => {
                el.classList.remove("show");
                this.#timeout = null;
            }, 200);
        });

        addListenerAll(html, ".header [data-action]", (event, el) => {
            switch (el.dataset.action as MenuEventAction) {
                case "add-trigger": {
                    return this.#addTrigger();
                }

                case "add-subtrigger": {
                    return this.#addSubtrigger();
                }

                case "close-window": {
                    return this.#closeAndSave();
                }

                case "export-all": {
                    return this.blueprint.exportTriggers();
                }

                case "import": {
                    this.#import();
                    return;
                }
            }
        });

        this.#activateTriggersListeners(html);
    }

    #activateTriggersListeners(html: HTMLElement) {
        addListenerAll(html, ".trigger .name", "contextmenu", (event, el) => {
            const triggerId = htmlClosest(el, "[data-id]")?.dataset.id ?? "";
            this.#editTrigger(triggerId);
        });

        addListenerAll(
            html,
            ".trigger [name='enabled']",
            "change",
            (event, el: HTMLInputElement) => {
                const triggerId = htmlClosest(el, "[data-id]")?.dataset.id ?? "";
                const trigger = this.blueprint.getTrigger(triggerId);

                if (trigger) {
                    trigger.disabled = !el.checked;
                }
            }
        );

        addListenerAll(html, ".trigger [data-action]", (event, el) => {
            const triggerId = htmlClosest(el, "[data-id]")?.dataset.id ?? "";

            switch (el.dataset.action as TriggersEventAction) {
                case "select-trigger": {
                    this.blueprint.setTrigger(triggerId);
                    return this.refresh(true);
                }

                case "delete-trigger": {
                    return this.#deleteTrigger(triggerId);
                }

                case "export-trigger": {
                    return this.blueprint.exportTrigger(triggerId);
                }
            }
        });
    }
}

type MenuEventAction = "close-window" | "add-trigger" | "export-all" | "import" | "add-subtrigger";
type TriggersEventAction = "select-trigger" | "export-trigger" | "delete-trigger";

type TriggersMenuData = {
    triggers: { name: string; id: string }[];
    subtriggers: { name: string; id: string }[];
    selected: Maybe<string>;
    i18n: TemplateLocalize;
};

export { TriggersMenu };
