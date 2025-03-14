import { localize, render, templateLocalize, waitDialog } from "module-helpers";
import { makeCustomNode } from "../blueprint-node-custom";
import { SplitterBlueprintNode } from "./blueprint-splitter";

class StringListSplitterBlueprintNode extends makeCustomNode(SplitterBlueprintNode) {
    get context() {
        return ["add-entry", ...super.context];
    }

    async _onContext(context: string): Promise<void> {
        switch (context) {
            case "add-entry": {
                this.#addEntry();
                return;
            }

            default: {
                return super._onContext(context);
            }
        }
    }

    async #addEntry() {
        const result = await waitDialog<{ name: string; value: string }>(
            {
                title: localize("add-entry.entry"),
                focus: "[name='value']",
                content: await render("add-entry", {
                    useValue: true,
                    i18n: templateLocalize("add-entry"),
                }),
                yes: {
                    label: localize("add-entry.yes"),
                    icon: "fa-solid fa-check",
                },
                no: {
                    label: localize("add-entry.no"),
                    icon: "fa-solid fa-xmark",
                },
            },
            { animation: false }
        );

        if (!result || !result.value.trim()) return;

        const entries = this.data.custom.outputs as NodeSchemaBridge[];

        entries.push({
            key: result.value,
            label: result.name.trim() || result.value,
        });

        this.refresh(true);
    }
}

export { StringListSplitterBlueprintNode };
