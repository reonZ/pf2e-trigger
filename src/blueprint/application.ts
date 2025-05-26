import { Blueprint, getConnectorColor, TriggersExportMenu, TriggersImportMenu } from "blueprint";
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
    info,
    localize,
    R,
    templateLocalize,
    TemplateLocalize,
    waitDialog,
} from "module-helpers";
import { EVENT_KEYS, NodeEventKey } from "schema";
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

    bringToFront() {
        this.element.style.zIndex = String(++apps.ApplicationV2._maxZ);
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
        this.bringToFront();
    }

    _onFirstRender(context: object, options: BlueprintMenuRenderOptions) {
        this.bringToFront();
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
            (t) => t.isSubtrigger
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
        type TriggerHeaderAction = "close-window" | "create-trigger" | "export" | "import";
        type TriggerAction = "select-trigger" | "delete-trigger" | "copy-id";
        type SubtriggerHeaderAction = "create-subtrigger";
        type VariableHeaderAction = "create-variable";
        type VariableAction = "remove-variable";
        type HeaderAction = TriggerHeaderAction | SubtriggerHeaderAction | VariableHeaderAction;

        const getEntryId = (el: HTMLElement) => {
            return htmlClosest(el, "[data-id]")?.dataset.id ?? "";
        };

        addListenerAll(html, ".trigger[data-id] .name", "contextmenu", (el) => {
            const triggerId = getEntryId(el);
            this.#editTrigger(triggerId);
        });

        addListenerAll(
            html,
            ".trigger[data-id] [name='enabled']",
            "change",
            (el: HTMLInputElement) => {
                const triggerId = getEntryId(el);
                const trigger = this.blueprint.getTrigger(triggerId);

                if (trigger) {
                    trigger.update({ enabled: el.checked });
                    this.refresh();
                }
            }
        );

        addListenerAll(html, ".header [data-action]", (el) => {
            const action = el.dataset.action as HeaderAction;

            if (action === "close-window") {
                this.#closeAndSave();
            } else if (action === "create-subtrigger") {
                this.#createSubtrigger();
            } else if (action === "create-trigger") {
                this.#createTrigger();
            } else if (action === "create-variable") {
                this.blueprint.createVariable();
            } else if (action === "export") {
                new TriggersExportMenu(this.blueprint.triggers).render(true);
            } else if (action === "import") {
                new TriggersImportMenu(this.blueprint).render(true);
            }
        });

        addListenerAll(html, ".trigger[data-id] [data-action]", (el) => {
            const triggerId = getEntryId(el);
            const action = el.dataset.action as TriggerAction;

            if (action === "copy-id") {
                game.clipboard.copyPlainText(triggerId);
                info("blueprint-menu.sidebar.trigger.copied", { id: triggerId });
            } else if (action === "delete-trigger") {
                this.#deleteTrigger(triggerId);
            } else if (action === "select-trigger") {
                this.blueprint.setTrigger(triggerId);
            }
        });

        addListenerAll(html, ".variable[data-id] .name", "contextmenu", (el) => {
            const entryId = getEntryId(el) as NodeEntryId;
            this.blueprint.editVariable(entryId);
        });

        addListenerAll(html, ".variable[data-id] [data-action]", (el) => {
            const entryId = getEntryId(el) as NodeEntryId;
            const action = el.dataset.action as VariableAction;

            if (action === "remove-variable") {
                this.blueprint.deleteVariable(entryId);
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

        addListenerAll(html, "[data-action]", (el) => {
            const action = el.dataset.action as EventAction;

            if (action === "collapse-window") {
                this.element.classList.add("collapsed");
            } else if (action === "reset-triggers") {
                this.#resetTriggers();
            } else if (action === "save-triggers") {
                this.#saveTriggers();
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
        const result = await waitDialog<{ name: string; event: NodeEventKey }>({
            content: [
                {
                    type: "text",
                    inputConfig: { name: "name", required: true },
                },
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
            data: trigger,
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
            data: trigger,
        });

        if (result && result.name !== trigger.name) {
            trigger.update({ name: result.name });

            if (trigger.isSubtrigger) {
                this.blueprint.refresh();
            } else {
                this.refresh();
            }
        }
    }

    async #closeAndSave() {
        const result = await confirmDialog("close-window", {
            skipAnimate: true,
        });

        if (result === null) return;

        if (result) {
            this.blueprint.saveTriggers();
        }

        this.close();
    }

    async #saveTriggers() {
        const result = await confirmDialog("save-triggers", {
            skipAnimate: true,
        });

        if (result) {
            this.blueprint.saveTriggers();
        }
    }

    async #resetTriggers() {
        const result = await confirmDialog("reset-triggers", {
            skipAnimate: true,
        });

        if (result) {
            this.blueprint.resetTriggers();
        }
    }
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
