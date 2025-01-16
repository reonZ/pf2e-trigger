import { Blueprint } from "@blueprint/blueprint";
import { EventNodeKey, getEventKeys } from "@schema/schema-list";
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
    htmlClosest,
    htmlQuery,
    localize,
    render,
    templateLocalize,
    waitDialog,
} from "module-helpers";

class TriggersMenu extends foundry.applications.api.ApplicationV2 {
    #blueprint: Blueprint | null = null;
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

    get blueprint(): Blueprint | null {
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
        this.#blueprint?.destroy();
    }

    protected async _prepareContext(options?: ApplicationRenderOptions): Promise<TriggersMenuData> {
        return {
            triggers: this.blueprint?.triggersList ?? [],
            selected: this.blueprint?.trigger?.id,
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
            this.#blueprint = new Blueprint(this.element);
            this.refresh();
        });
    }

    async refresh(close?: boolean) {
        const data = await this._prepareContext();
        const template = await render("triggers-menu", data);
        const wrapper = createHTMLElement("div", { innerHTML: template });

        const oldTitle = htmlQuery(this.element, ".trigger-title");
        if (oldTitle) {
            oldTitle.innerText = this.blueprint?.trigger?.name ?? "";
        }

        const newTriggers = htmlQuery(wrapper, "ul.triggers");
        const oldTriggers = htmlQuery(this.sidebar, "ul.triggers");

        if (newTriggers && oldTriggers) {
            oldTriggers.replaceWith(newTriggers);
            this.#activateTriggersListeners(newTriggers);
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

                case "close-window": {
                    return this.#closeAndSave();
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

        addListenerAll(html, ".trigger [data-action]", (event, el) => {
            const triggerId = htmlClosest(el, "[data-id]")?.dataset.id ?? "";

            switch (el.dataset.action as TriggersEventAction) {
                case "select-trigger": {
                    this.blueprint?.setTrigger(triggerId);
                    return this.refresh(true);
                }

                case "delete-trigger": {
                    return this.#deleteTrigger(triggerId);
                }
            }
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
            this.blueprint?.saveTrigger();
        }

        this.close();
    }

    async #deleteTrigger(id: string) {
        const trigger = this.blueprint?.getTrigger(id);
        if (!trigger) return;

        const result = await confirmDialog(
            {
                title: localize("triggers-menu.trigger.delete.title"),
                content: localize("triggers-menu.trigger.delete.prompt", trigger),
            },
            { animation: false }
        );

        if (!result) return;

        const isCurrent = this.blueprint?.trigger?.id === id;

        this.blueprint?.deleteTrigger(id);

        this.refresh(isCurrent);
    }

    async #addTrigger() {
        const events = R.pipe(
            getEventKeys(),
            R.map((key) => ({
                value: key,
                label: localize("node.event", key, "title"),
            })),
            R.sortBy(R.prop("label"))
        );

        const result = await waitDialog<{ name: string; event: EventNodeKey }>(
            {
                title: localize("add-trigger.title"),
                content: await render("add-trigger", {
                    events,
                    i18n: templateLocalize("add-trigger"),
                }),
                yes: {
                    label: localize("add-trigger.yes"),
                    icon: "fa-solid fa-check",
                },
                no: {
                    label: localize("add-trigger.no"),
                    icon: "fa-solid fa-xmark",
                },
            },
            { animation: false }
        );

        if (!result) return;

        this.blueprint?.createTrigger(result);
        this.refresh(true);
    }

    async #editTrigger(id: string) {
        const trigger = this.blueprint?.getTrigger(id);
        if (!trigger) return;

        const result = await waitDialog<{ name: string }>(
            {
                title: localize("edit-trigger.title"),
                content: await render("add-trigger", {
                    name: trigger.name,
                    i18n: templateLocalize("edit-trigger"),
                }),
                yes: {
                    label: localize("edit-trigger.yes"),
                    icon: "fa-solid fa-check",
                },
                no: {
                    label: localize("edit-trigger.no"),
                    icon: "fa-solid fa-xmark",
                },
            },
            { animation: false }
        );

        if (!result || result.name === trigger.name) return;

        this.blueprint?.editTrigger(id, result);
        this.refresh();
    }
}

type MenuEventAction = "close-window" | "add-trigger" | "export-all" | "import";
type TriggersEventAction = "select-trigger" | "export-trigger" | "delete-trigger";

type TriggersMenuData = {
    triggers: { name: string; id: string }[];
    selected: Maybe<string>;
    i18n: TemplateLocalize;
};

export { TriggersMenu };
