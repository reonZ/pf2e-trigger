import { TriggerDataSource } from "data";
import {
    addListenerAll,
    ApplicationConfiguration,
    ApplicationRenderOptions,
    htmlClosest,
    htmlQuery,
    htmlQueryAll,
    ItemSourcePF2e,
    render,
    RenderTemplateData,
} from "module-helpers";

abstract class ImportExportMenu extends foundry.applications.api.ApplicationV2 {
    #resources: ImportExportResources = {
        trigger: new Collection(),
        subtrigger: new Collection(),
        item: new Collection(),
    };

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        window: {
            positioned: true,
        },
        position: {
            width: 900,
        },
    };

    abstract get canAddItem(): boolean;

    abstract _getButtons(): { action: string; label: string }[];

    get resources(): ImportExportResources {
        return this.#resources;
    }

    createResource({
        type,
        id,
        name,
        added = false,
        selected = false,
    }: createResourceOptions): ImportExportResource {
        const resource: ImportExportResource = {
            id,
            name,
            selected: selected || added,
            added,
            trigger: new Set(),
            subtrigger: new Set(),
            item: new Set(),
        };

        this.resources[type].set(id, resource);

        return resource;
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<ImportExportContext> {
        return {
            buttons: this._getButtons(),
            canAddItem: this.canAddItem,
            resources: this.#resources,
            i18n: "import-export-menu",
        };
    }

    async _renderHTML(
        context: ImportExportContext,
        options: ApplicationRenderOptions
    ): Promise<string> {
        return await render("import-export-menu", context);
    }

    _replaceHTML(result: string, content: HTMLElement, options: ApplicationRenderOptions): void {
        content.innerHTML = result;
        this.#activateListeners(content);
    }

    _onClickAction(event: PointerEvent, target: HTMLElement): any {
        type Action = "cancel" | "toggle-all";

        switch (target.dataset.action as Action) {
            case "cancel": {
                return this.close();
            }

            case "toggle-all": {
                return this.#toggleAll(target);
            }
        }
    }

    #toggleAll(target: HTMLElement) {
        const parent = htmlClosest(target, `[data-type]`);
        const type = parent?.dataset.type as ImportExportCategory;
        const ul = htmlQuery(parent, `ul`);
        const inputs = htmlQueryAll<HTMLInputElement>(ul, `li input`);
        const checked = inputs.some((input) => !input.checked);

        for (const input of inputs) {
            input.checked = checked;
        }

        for (const resource of this.#resources[type] ?? []) {
            resource.selected = checked;
        }
    }

    #activateListeners(html: HTMLElement) {
        addListenerAll(html, "input", "change", (event, el) => {
            const type = htmlClosest(el, `[data-type]`)?.dataset.type as ImportExportCategory;
            const resourceId = htmlClosest(el, `[data-resource-id]`)?.dataset.resourceId as string;
            const resource = this.#resources[type]?.get(resourceId);

            if (resource) {
                resource.selected = el.checked;
            }
        });
    }
}

type ImportExportContext = RenderTemplateData & {
    canAddItem: boolean;
    buttons: { action: string; label: string }[];
    resources: ImportExportResources;
};

type ImportExportCategory = "trigger" | "subtrigger" | "item";

type ImportExportResources = Record<ImportExportCategory, Collection<ImportExportResource>>;

type ImportExportResource = {
    id: string;
    name: string;
    selected: boolean;
    added: boolean;
    trigger: Set<string>;
    subtrigger: Set<string>;
    item: Set<string>;
};

type createResourceOptions = {
    type: ImportExportCategory;
    id: string;
    name: string;
    added?: boolean;
    selected?: boolean;
};

type ImportExportData = {
    triggers: TriggerDataSource[];
    items: ItemSourcePF2e[];
};

export { ImportExportMenu };
export type { ImportExportData };
