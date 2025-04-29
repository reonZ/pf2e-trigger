import { Blueprint, getConnectorColor } from "blueprint";
import { NodeEntryId, TriggerData, TriggerDataVariable } from "data";
import {
    addListener,
    addListenerAll,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    confirmDialog,
    HandlebarsRenderOptions,
    HandlebarsTemplatePart,
    htmlClosest,
    htmlQuery,
    localize,
    R,
    templateLocalize,
    TemplateLocalize,
    waitDialog,
} from "module-helpers";
import { EVENT_KEYS, EventKey } from "schema";
import apps = foundry.applications.api;

class BlueprintApplication extends apps.HandlebarsApplicationMixin(
    apps.ApplicationV2<ApplicationConfiguration, BlueprintMenuRenderOptions>
) {
    #blueprint = new Blueprint();
    #showSidebar = true;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        window: {
            resizable: false,
            minimizable: false,
            frame: false,
            positioned: false,
        },
        id: "pf2e-trigger-blueprint-menu",
        classes: ["app", "window-app"],
    };

    static PARTS: Record<BlueprintMenuPart, HandlebarsTemplatePart> = {
        sidebar: {
            template: "modules/pf2e-trigger/templates/blueprint-menu/sidebar.hbs",
        },
        title: {
            template: "modules/pf2e-trigger/templates/blueprint-menu/title.hbs",
        },
        windowControls: {
            template: "modules/pf2e-trigger/templates/blueprint-menu/window-controls.hbs",
        },
        windowCollapsed: {
            template: "modules/pf2e-trigger/templates/blueprint-menu/window-collapsed.hbs",
        },
    };

    get blueprint(): Blueprint {
        return this.#blueprint;
    }

    get trigger(): TriggerData | undefined {
        return this.blueprint.trigger;
    }

    get sidebar(): HTMLElement | null {
        return htmlQuery(this.element, `[data-application-part="sidebar"]`);
    }

    async close(options: ApplicationClosingOptions = {}) {
        options.animate = false;
        return super.close(options);
    }

    refresh() {
        this.render({ parts: ["sidebar", "title"] });
    }

    toggleSidebar(show?: boolean) {
        this.#showSidebar = show ?? !this.#showSidebar;
        this.sidebar?.classList.toggle("show", this.#showSidebar);
    }

    toggleCollapsed(collapse?: boolean) {
        this.element.classList.toggle("collapsed", collapse);
    }

    _onFirstRender(context: object, options: BlueprintMenuRenderOptions) {
        // we wait one frame before initializing the canvas
        requestAnimationFrame(() => {
            this.blueprint.initialize(this);
        });
    }

    protected _onClose() {
        this.blueprint.destroy();
    }

    async _preparePartContext(partId: BlueprintMenuPart, context: object) {
        switch (partId) {
            case "sidebar": {
                return this.#prepareSidebarContext();
            }

            case "title": {
                return {
                    title: this.trigger?.label ?? "",
                } satisfies BlueprintMenuParts["title"];
            }

            case "windowControls": {
                return {
                    i18n: templateLocalize("blueprint-menu.controls"),
                } satisfies BlueprintMenuParts["windowControls"];
            }

            case "windowCollapsed": {
                return {
                    i18n: templateLocalize("blueprint-menu.collapsed"),
                } satisfies BlueprintMenuParts["windowCollapsed"];
            }
        }
    }

    async _attachPartListeners(
        partId: BlueprintMenuPart,
        html: HTMLElement,
        options: HandlebarsRenderOptions
    ) {
        switch (partId) {
            case "sidebar": {
                return this.#attachSidebarListeners(html);
            }

            case "windowControls": {
                return this.#attachControlsListeners(html);
            }

            case "windowCollapsed": {
                return this.#attachCollapsedListeners(html);
            }
        }
    }

    async #prepareSidebarContext(): Promise<BlueprintMenuParts["sidebar"]> {
        const trigger = this.trigger;
        const [subtriggers, triggers] = R.partition(
            this.blueprint.triggers.contents,
            (t) => t.isSubtriggerNode
        );

        const variables = R.pipe(
            trigger?.variables ?? {},
            R.entries(),
            R.map(([id, variable]): BlueprintVariable => {
                return {
                    ...variable,
                    id,
                    color: getConnectorColor(variable.type, true),
                    type: localize("entry", variable.type),
                };
            }),
            R.sortBy(R.prop("label"))
        );

        return {
            i18n: templateLocalize("blueprint-menu.sidebar"),
            selected: trigger?.id,
            showSidebar: this.#showSidebar,
            subtriggers,
            triggers,
            variables,
        };
    }

    #attachSidebarListeners(html: HTMLElement) {
        type TriggerHeaderAction = "close-window" | "create-trigger" | "export-all" | "import";
        type TriggerAction = "select-trigger" | "export-trigger" | "delete-trigger";
        type SubtriggerHeaderAction = "create-subtrigger";
        type VariableHeaderAction = "create-variable";
        type VariableAction = "remove-variable";
        type HeaderAction = TriggerHeaderAction | SubtriggerHeaderAction | VariableHeaderAction;

        const getEntryId = (el: HTMLElement) => {
            return htmlClosest(el, "[data-id]")?.dataset.id ?? "";
        };

        addListenerAll(html, ".trigger[data-id] .name", "contextmenu", (event, el) => {
            const triggerId = getEntryId(el);
            this.#editTrigger(triggerId);
        });

        addListenerAll(
            html,
            ".trigger[data-id] [name='enabled']",
            "change",
            (event, el: HTMLInputElement) => {
                const triggerId = getEntryId(el);
                const trigger = this.blueprint.getTrigger(triggerId);

                if (trigger) {
                    trigger.update({ enabled: el.checked });
                    this.refresh();
                }
            }
        );

        addListenerAll(html, ".header [data-action]", (event, el) => {
            switch (el.dataset.action as HeaderAction) {
                case "close-window": {
                    return;
                }

                case "create-trigger": {
                    return this.#createTrigger();
                }

                case "export-all": {
                    return;
                }

                case "import": {
                    return;
                }

                case "create-subtrigger": {
                    return this.#createSubtrigger();
                }

                case "create-variable": {
                    return this.blueprint.createVariable();
                }
            }
        });

        addListenerAll(html, ".trigger[data-id] [data-action]", (event, el) => {
            const triggerId = getEntryId(el);

            switch (el.dataset.action as TriggerAction) {
                case "select-trigger": {
                    return this.blueprint.setTrigger(triggerId);
                }

                case "delete-trigger": {
                    return this.#deleteTrigger(triggerId);
                }

                case "export-trigger": {
                    return this.#exportTrigger(triggerId);
                }
            }
        });

        addListenerAll(html, ".variable[data-id] .name", "contextmenu", (event, el) => {
            const entryId = getEntryId(el) as NodeEntryId;
            this.blueprint.editVariable(entryId);
        });

        addListenerAll(html, ".variable[data-id] [data-action]", (event, el) => {
            const entryId = getEntryId(el) as NodeEntryId;

            switch (el.dataset.action as VariableAction) {
                case "remove-variable": {
                    return this.blueprint.deleteVariable(entryId);
                }
            }
        });

        addListener(html, `[data-action="toggle-sidebar"]`, () => {
            this.toggleSidebar();
        });
    }

    #attachCollapsedListeners(html: HTMLElement) {
        addListener(html, "[data-action]", () => {
            this.element.classList.remove("collapsed");
        });
    }

    #attachControlsListeners(html: HTMLElement) {
        type EventAction = "collapse-window" | "save-triggers" | "reset-triggers";

        addListenerAll(html, "[data-action]", (event, el) => {
            switch (el.dataset.action as EventAction) {
                case "collapse-window": {
                    return this.element.classList.add("collapsed");
                }

                case "save-triggers": {
                    return this.#saveTriggers();
                }

                case "reset-triggers": {
                    return this.#resetTriggers();
                }
            }
        });
    }

    async #createSubtrigger() {
        const result = await waitDialog<{ name: string }>({
            content: [
                {
                    type: "text",
                    inputConfig: { name: "name" },
                    groupConfig: { i18n: "create-trigger" },
                },
            ],
            i18n: "create-subtrigger",
            skipAnimate: true,
        });

        if (result) {
            this.blueprint.createTrigger({ name: result.name, event: "subtrigger-input" });
        }
    }

    async #createTrigger() {
        const result = await waitDialog<{ name: string; event: EventKey }>({
            content: [
                { type: "text", inputConfig: { name: "name" } },
                {
                    type: "select",
                    inputConfig: {
                        name: "event",
                        options: EVENT_KEYS,
                        i18n: { prefix: "node.event", suffix: "label" },
                        sort: true,
                    },
                },
            ],
            i18n: "create-trigger",
            skipAnimate: true,
        });

        if (result) {
            this.blueprint.createTrigger(result);
        }
    }

    async #deleteTrigger(id: string) {
        const trigger = this.blueprint.getTrigger(id);
        if (!trigger) return;

        const result = await confirmDialog("delete-trigger", {
            skipAnimate: true,
            data: { name: trigger.label },
        });

        if (result) {
            this.blueprint.deleteTrigger(id);
        }
    }

    async #editTrigger(id: string) {
        const trigger = this.blueprint.getTrigger(id);
        if (!trigger) return;

        const result = await waitDialog<{ name: string }>({
            content: [
                {
                    type: "text",
                    inputConfig: {
                        name: "name",
                        value: trigger.name,
                        placeholder: trigger.label,
                    },
                    groupConfig: {
                        i18n: "create-trigger",
                    },
                },
            ],
            i18n: "edit-trigger",
            skipAnimate: true,
        });

        if (result && result.name !== trigger.name) {
            trigger.update({ name: result.name });
            this.refresh();
        }
    }

    #exportTrigger(id: string) {}

    #saveTriggers() {}

    #resetTriggers() {}
}

type BlueprintMenuRenderOptions = Omit<HandlebarsRenderOptions, "parts"> & {
    parts?: BlueprintMenuPart[];
};

type BlueprintMenuParts = {
    sidebar: {
        i18n: TemplateLocalize;
        selected: Maybe<string>;
        showSidebar: boolean;
        subtriggers: TriggerData[];
        triggers: TriggerData[];
        variables: BlueprintVariable[];
    };
    title: {
        title: string;
    };
    windowControls: {
        i18n: TemplateLocalize;
    };
    windowCollapsed: {
        i18n: TemplateLocalize;
    };
};

type BlueprintVariable = Omit<TriggerDataVariable, "type"> & {
    id: NodeEntryId;
    color: string;
    type: string;
};

type BlueprintMenuPart = keyof BlueprintMenuParts;

export { BlueprintApplication };
