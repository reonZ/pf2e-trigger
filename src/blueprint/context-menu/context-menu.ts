import {
    ApplicationConfiguration,
    ApplicationRenderOptions,
    addListenerAll,
    localize,
} from "module-helpers";
import { BlueprintMenu } from "../blueprint-menu";
import { BlueprintNodeEntry } from "@blueprint/node/node-entry";
import { BlueprintNode } from "@blueprint/node/blueprint-node";

abstract class BlueprintContextMenu<
    TReturn extends string,
    TSource extends BlueprintNodeEntry | BlueprintNode
> extends BlueprintMenu<TReturn, TSource> {
    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        classes: ["context-menu"],
    };

    abstract get entries(): TReturn[];

    get template(): string {
        return "context-menu";
    }

    async _prepareContext(options: ApplicationRenderOptions): Promise<ContextMenuData> {
        const entries = this.entries.map((value) => {
            return {
                value,
                label: localize("context", value),
            };
        });

        return {
            entries,
        };
    }

    _activateListeners(html: HTMLElement) {
        super._activateListeners(html);

        addListenerAll(html, "li", (event, el) => {
            event.stopPropagation();

            const value = el.dataset.value as TReturn;

            this.resolve(value);
            this.close();
        });
    }
}

type ContextMenuData = {
    entries: { value: string; label: string }[];
};

export { BlueprintContextMenu };
