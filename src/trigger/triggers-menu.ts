import { Blueprint } from "@blueprint/blueprint";
import { getEventNodeKeys } from "@node/trigger-nodes-list";
import {
    R,
    TemplateLocalize,
    addListenerAll,
    createHTMLElement,
    htmlClosest,
    htmlQuery,
    localize,
    render,
    subLocalize,
    templateLocalize,
    templatePath,
    waitDialog,
} from "module-helpers";
import { Trigger } from "./trigger";
import triggers, { TriggerCollection } from "./triggers";

const menuLocalize = subLocalize("triggers-menu");

class TriggersMenu extends FormApplication {
    #blueprint: Blueprint | null = null;

    static get defaultOptions(): FormApplicationOptions {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "pf2e-trigger-triggers-menu",
            title: menuLocalize("title"),
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
        this.#blueprint?.destroy(true, true);
        this.#blueprint = null;
        return super.render(force, options);
    }

    async close(options?: { force?: boolean }): Promise<void> {
        this.#blueprint?.destroy(true, true);
        this.#blueprint = null;
        return super.close(options);
    }

    protected async _render(force?: boolean, options?: RenderOptions): Promise<void> {
        await super._render(force, options);
        this.#createPixiApplication();
    }

    getData(options?: Partial<FormApplicationOptions>): BlueprintMenuData {
        return {
            triggers,
            i18n: menuLocalize.i18n,
            selected: this.blueprint?.trigger?.id,
        };
    }

    async refreshSidebar() {
        const data = this.getData();
        const template = await render("triggers-menu", data);
        const sidebar = createHTMLElement("div", { innerHTML: template });

        this.sidebar?.replaceWith(sidebar.firstElementChild!);
        this.activateListeners(this.element);
    }

    activateListeners($html: JQuery): void {
        const html = $html[0];

        addListenerAll(html, "[data-action]", (event, el) => {
            const getTrigger = () => {
                const triggerId = htmlClosest(el, "[data-id]")?.dataset.id;
                return triggers.get(triggerId ?? "");
            };

            switch (el.dataset.action as EventAction) {
                case "select-trigger": {
                    const trigger = getTrigger();
                    return this.#selectTrigger(trigger);
                }

                case "close-window": {
                    return;
                }

                case "add-trigger": {
                    return this.#addTrigger();
                }

                case "export-trigger": {
                    return;
                }

                case "delete-trigger": {
                    return;
                }
            }
        });
    }

    async #addTrigger() {
        const events = R.pipe(
            getEventNodeKeys(),
            R.map((key) => ({
                value: key,
                label: localize("node.event", key, "title"),
            })),
            R.sortBy(R.prop("label"))
        );

        const result = await waitDialog<{ name: string; event: string }>(
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

        const trigger = triggers.createEventTrigger(result);

        this.blueprint?.setTrigger(trigger);
        this.refreshSidebar();
    }

    #selectTrigger(trigger: Trigger | undefined) {
        const sidebar = this.sidebar;
        if (!trigger || !this.blueprint || !sidebar) return;

        htmlQuery(sidebar, ".active")?.classList.remove("active");
        htmlQuery(sidebar, `.trigger[data-id="${trigger.id}"]`)?.classList.add("active");

        this.blueprint.setTrigger(trigger);
        sidebar.classList.add("no-hover");

        setTimeout(() => {
            sidebar.classList.remove("no-hover");
        }, 1000);
    }

    #createPixiApplication() {
        requestAnimationFrame(() => {
            const parent = htmlQuery(this.element[0], ".window-content");
            if (parent) {
                this.#blueprint = new Blueprint(parent);
            }
        });
    }

    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}

type EventAction =
    | "close-window"
    | "add-trigger"
    | "select-trigger"
    | "export-trigger"
    | "delete-trigger";

type BlueprintMenuData = FormApplicationData & {
    triggers: TriggerCollection;
    selected: string | undefined;
    i18n: TemplateLocalize;
};

export { TriggersMenu };
