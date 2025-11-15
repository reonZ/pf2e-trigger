import { Blueprint, getConnectorColor, TriggersExportMenu, TriggersImportMenu } from "blueprint";
import { NodeEntryId, TriggerData, TriggerDataSource, TriggerDataVariable } from "data";
import {
    addListener,
    addListenerAll,
    ApplicationClosingOptions,
    ApplicationConfiguration,
    arrayToSelectOptions,
    confirmDialog,
    createHTMLElement,
    enrichHTML,
    HandlebarsRenderOptions,
    HandlebarsTemplatePart,
    htmlClosest,
    htmlQuery,
    I18n,
    info,
    localize,
    MODULE,
    R,
    render,
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
            scrollable: [".scroll-triggers", ".scroll-subtriggers", ".scroll-variables"],
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

        if (MODULE.isDebug) {
            this.element.classList.add("debug");
        }

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
                    locked: this.blueprint.isTriggerLocked,
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
        const [subtriggers, triggers] = R.pipe(
            [this.blueprint.triggers.contents, ...this.blueprint.modulesTriggers],
            R.flat(),
            R.partition((trigger) => trigger.isSubtrigger),
            R.map((triggers): BlueprintMenuTriggersGroup[] => {
                const groups = R.pipe(
                    triggers,
                    R.groupBy(R.prop("folder")),
                    R.entries(),
                    R.sortBy(([folder]) => folder),
                    R.map(([folder, entries]): BlueprintMenuTriggersGroup => {
                        return { folder, entries };
                    })
                );

                // we move the folderless group at the end
                if (groups.length > 1 && groups[0].folder === "") {
                    groups.push(groups.shift()!);
                }

                return groups;
            })
        );

        const moduleLocked = this.blueprint.isTriggerLocked
            ? localize("blueprint-menu.sidebar.locked.variable")
            : null;

        const variables = R.pipe(
            trigger?.variables ?? {},
            R.entries(),
            R.filter(([_, variable]) => !variable.locked),
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
            isEnabled: (trigger: TriggerData) => {
                return this.blueprint.isEnabled(trigger);
            },
            moduleLocked,
            selected: trigger?.id,
            showSidebar: this.#showSidebar,
            subtriggers,
            triggers,
            variables,
        };
    }

    #attachSidebarListeners(html: HTMLElement) {
        const getEntryId = (el: HTMLElement): string => {
            return htmlClosest(el, "[data-id]")?.dataset.id ?? "";
        };

        const getEntryDataset = (el: HTMLElement): { id: string; module?: string } | null => {
            const { id, module } = htmlClosest(el, "[data-id]")?.dataset ?? {};
            return id ? { id, module } : null;
        };

        const getTriggerDescriptionPanel = (): HTMLElement | null => {
            return htmlQuery(this.element, ":scope > [data-trigger-description]");
        };

        const getdescriptionKey = (el: HTMLElement): string => {
            const { id, module } = el.dataset;
            return module ? `${module}:${id}` : id ?? "";
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
                const entry = getEntryDataset(el);
                const trigger = this.blueprint.getTrigger(entry);
                if (!trigger) return;

                this.blueprint.updateEnabled(trigger, el.checked);
            }
        );

        addListenerAll(html, ".trigger[data-id]", "pointerenter", async (el) => {
            if (getTriggerDescriptionPanel()) return;

            let descriptionElement = htmlQuery(el, "[data-trigger-description]");

            if (!descriptionElement) {
                const entry = getEntryDataset(el);
                const trigger = this.blueprint.getTrigger(entry);
                if (!trigger) return;

                descriptionElement = createHTMLElement("div", {
                    content: await enrichHTML(trigger.description),
                    dataset: { triggerDescription: getdescriptionKey(el) },
                });

                el.appendChild(descriptionElement);
            }

            if (!descriptionElement) return;

            if (descriptionElement.childNodes.length) {
                el.classList.add("show-description");
            }

            const cloneElement = descriptionElement.cloneNode(true);
            this.element.appendChild(cloneElement);
        });

        addListenerAll(html, ".trigger[data-id]", "pointerleave", (el) => {
            const key = getdescriptionKey(el);
            const panel = getTriggerDescriptionPanel();
            if (panel && panel.dataset.triggerDescription !== key) return;

            const selector = el.classList.contains("description-locked")
                ? `:not([data-trigger-description^="${key}"])`
                : "";

            const elements = this.element.querySelectorAll<HTMLElement>(
                `:scope > [data-trigger-description]${selector}`
            );

            el.classList.remove("show-description");

            for (const el of elements) {
                el.remove();
            }
        });

        addListenerAll(html, ".header [data-action]", async (el) => {
            const action = el.dataset.action as HeaderAction;

            if (action === "close-window") {
                this.#closeAndSave();
            } else if (action === "create-subtrigger") {
                this.#createSubtrigger(el.dataset.folder);
            } else if (action === "create-trigger") {
                const result = await this.#createCreateEditMenu({ folder: el.dataset.folder });

                if (result) {
                    this.blueprint.createTrigger(result);
                }
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

            switch (action) {
                case "clone-trigger": {
                    const entry = getEntryDataset(el);
                    return entry && this.blueprint.cloneTrigger(entry);
                }

                case "copy-id": {
                    game.clipboard.copyPlainText(triggerId);
                    return info("blueprint-menu.sidebar.trigger.copied", { id: triggerId });
                }

                case "delete-trigger": {
                    return this.#deleteTrigger(triggerId);
                }

                case "lock-description": {
                    return htmlClosest(el, "[data-id]")?.classList.toggle("description-locked");
                }

                case "select-trigger": {
                    const entry = getEntryDataset(el);
                    return entry && this.blueprint.setTrigger(entry);
                }
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

    async #createCreateEditMenu({
        folder,
        noEvents,
        trigger,
    }: { folder?: string; noEvents?: boolean; trigger?: TriggerData } = {}): Promise<
        CreateEditMenuResult | false | null
    > {
        const localizationKey = `${trigger ? "edit" : "create"}-trigger`;
        const events = noEvents
            ? undefined
            : arrayToSelectOptions(
                  EVENT_KEYS,
                  I18n.from({ prefix: "node.event", suffix: "label" })
              );

        return waitDialog<CreateEditMenuResult>({
            classes: ["pf2e-trigger-create-edit-menu"],
            content: await render("create-edit-menu", {
                description: trigger?.description ?? "",
                enrichedDescription: trigger ? await enrichHTML(trigger.description) : "",
                events,
                folder: trigger?.folder ?? folder ?? "",
                name: trigger?.name ?? "",
                placeholder: trigger?.label ?? "",
            }),
            i18n: localizationKey,
            skipAnimate: true,
            minWidth: "700px",
            title: localize(localizationKey, "title", trigger ?? {}),
        });
    }

    async #createSubtrigger(folder: string | undefined) {
        const result = await this.#createCreateEditMenu({ folder, noEvents: true });

        if (result) {
            this.blueprint.createTrigger({
                description: result.description,
                event: "subtrigger-input",
                folder: result.folder,
                name: result.name,
            });
        }
    }

    async #editTrigger(id: string) {
        const trigger = this.blueprint.getTrigger({ id });
        if (!trigger) return;

        const result = await this.#createCreateEditMenu({ noEvents: true, trigger });
        if (!result) return;

        const { description, folder, name } = result;

        trigger.update({ description, folder, name });

        if (trigger.isSubtrigger) {
            this.blueprint.refresh();
        } else {
            this.refresh();
        }
    }

    async #deleteTrigger(id: string) {
        const trigger = this.blueprint.getTrigger({ id });
        if (!trigger) return;

        const result = await confirmDialog("delete-trigger", {
            skipAnimate: true,
            data: trigger,
        });

        if (result) {
            this.blueprint.deleteTrigger(id);
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

type TriggerHeaderAction = "close-window" | "create-trigger" | "export" | "import";

type TriggerAction =
    | "clone-trigger"
    | "copy-id"
    | "delete-trigger"
    | "lock-description"
    | "select-trigger";

type SubtriggerHeaderAction = "create-subtrigger";

type VariableHeaderAction = "create-variable";

type VariableAction = "remove-variable";

type HeaderAction = TriggerHeaderAction | SubtriggerHeaderAction | VariableHeaderAction;

type BlueprintMenuRenderOptions = Omit<HandlebarsRenderOptions, "parts"> & {
    parts?: BlueprintMenuPart[];
};

type CreateEditMenuResult = Pick<TriggerDataSource, "description" | "folder" | "name"> & {
    event: NodeEventKey;
};

type BlueprintMenuTriggersGroup = {
    folder: string;
    entries: TriggerData[];
};

type BlueprintMenuParts = {
    sidebar: {
        i18n: TemplateLocalize;
        isEnabled: (trigger: TriggerData) => boolean;
        moduleLocked: string | null;
        selected: Maybe<string>;
        showSidebar: boolean;
        subtriggers: BlueprintMenuTriggersGroup[];
        triggers: BlueprintMenuTriggersGroup[];
        variables: BlueprintVariable[];
    };
    title: {
        locked: boolean;
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
