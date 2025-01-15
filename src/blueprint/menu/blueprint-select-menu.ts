import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    R,
    addListenerAll,
    localize,
} from "module-helpers";
import { BlueprintMenu, BlueprintMenuOptions, BlueprintMenuResolve } from "./blueprint-menu";
import { Blueprint } from "@blueprint/blueprint";
import { NodeSchemaSelectOption } from "@schema/schema";

class BlueprintSelectMenu<
    T extends BlueprintSelectEntries
> extends BlueprintMenu<ExtractSelectionOption<T> | null> {
    #entries: BlueprintSelectEntries;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["select-menu"],
    };

    protected constructor(
        blueprint: Blueprint,
        target: Point | PIXI.Container,
        resolve: BlueprintSelectResolveValue<T>,
        entries: BlueprintSelectEntries,
        options?: DeepPartial<BlueprintMenuOptions>
    ) {
        super(blueprint, target, resolve, options);

        this.#entries = entries;
    }

    static open<T extends BlueprintSelectEntries>(
        blueprint: Blueprint,
        target: Point | PIXI.Container,
        entries: T,
        options?: DeepPartial<BlueprintMenuOptions>
    ): Promise<ExtractSelectionOption<T> | null> {
        return new Promise((resolve) => {
            const menu = new this(blueprint, target, resolve, entries, options);
            menu.render(true);
        });
    }

    get template(): string {
        return "select-menu";
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<ContextMenuData> {
        const entries = this.#entries.map((entry) => {
            return R.isPlainObject(entry)
                ? entry
                : { value: entry, label: localize("select", entry) };
        });

        return {
            entries,
        };
    }

    protected _activateListeners(html: HTMLElement) {
        addListenerAll(html, "li", (event, el) => {
            event.stopPropagation();

            const value = el.dataset.value as ExtractSelectionOption<T>;

            this.resolve(value);
            this.close();
        });
    }
}

type ContextMenuData = {
    entries: BlueprintSelectEntries;
};

type BlueprintSelectEntries = ReadonlyArray<string | NodeSchemaSelectOption>;

type BlueprintSelectResolveValue<T extends BlueprintSelectEntries> =
    BlueprintMenuResolve<ExtractSelectionOption<T> | null>;

export { BlueprintSelectMenu };
