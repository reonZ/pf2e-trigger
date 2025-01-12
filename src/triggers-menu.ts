import { Blueprint } from "@blueprint/blueprint";
import { EventNodeKey, getEventKeys } from "@schema/schema-list";
import {
    R,
    TemplateLocalize,
    addListenerAll,
    confirmDialog,
    createHTMLElement,
    htmlClosest,
    htmlQuery,
    localize,
    render,
    templateLocalize,
    templatePath,
    waitDialog,
} from "module-helpers";

class TriggersMenu extends FormApplication {
    #blueprint: Blueprint | null = null;
    #timeout: NodeJS.Timeout | null = null;

    static get defaultOptions(): FormApplicationOptions {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "pf2e-trigger-triggers-menu",
            title: localize("triggers-menu.title"),
            template: templatePath("triggers-menu"),
            submitOnChange: false,
            submitOnClose: false,
            closeOnSubmit: true,
            scrollY: [".triggers"],
            left: 0,
            top: 5,
        } satisfies Partial<FormApplicationOptions>);
    }

    get blueprint(): Blueprint | null {
        return this.#blueprint;
    }

    get sidebar(): HTMLElement | null {
        return htmlQuery(this.element[0], ".window-content > .sidebar");
    }

    render(force?: boolean, options?: RenderOptions): this {
        if (this.rendered) return this;
        return super.render(force, options);
    }

    protected async _render(force?: boolean, options?: RenderOptions): Promise<void> {
        await super._render(force, options);
        this.#createPixiApplication();
    }

    getData(options?: Partial<FormApplicationOptions>): BlueprintMenuData {
        return {
            triggers: this.blueprint?.triggersList ?? [],
            selected: this.blueprint?.trigger?.id,
            i18n: templateLocalize("triggers-menu"),
        };
    }

    async refresh(close?: boolean) {
        const data = this.getData();
        const template = await render("triggers-menu", data);
        const wrapper = createHTMLElement("div", { innerHTML: template });

        const oldTitle = htmlQuery(this.element[0], ".trigger-title");
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

    activateListeners($html: JQuery<HTMLElement>): void {
        const html = $html[0];

        html.addEventListener("pointerenter", () => {
            if (this.#timeout) {
                clearTimeout(this.#timeout);
                this.#timeout = null;
            }
            html.classList.add("show");
        });

        html.addEventListener("pointerleave", () => {
            this.#timeout = setTimeout(() => {
                html.classList.remove("show");
                this.#timeout = null;
            }, 200);
        });

        addListenerAll(htmlQuery(html, ".header"), "[data-action]", (event, el) => {
            switch (el.dataset.action as MenuEventAction) {
                case "add-trigger": {
                    return this.#addTrigger();
                }

                case "close-window": {
                    // TODO do you want to save ?
                    return this.close();
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

    #createPixiApplication() {
        requestAnimationFrame(() => {
            const parent = htmlQuery(this.element[0], ".window-content");
            if (parent) {
                this.#blueprint = new Blueprint(parent);
                this.refresh();
            }
        });
    }

    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}

type MenuEventAction = "close-window" | "add-trigger" | "export-all" | "import";
type TriggersEventAction = "select-trigger" | "export-trigger" | "delete-trigger";

type BlueprintMenuData = FormApplicationData & {
    triggers: { name: string; id: string }[];
    selected: Maybe<string>;
    i18n: TemplateLocalize;
};

export { TriggersMenu };
