import { TriggerData } from "data";
import {
    ApplicationConfiguration,
    getItemSourceId,
    htmlClosest,
    info,
    ItemPF2e,
    localize,
    MODULE,
    R,
    setApplicationTitle,
    waitDialog,
} from "module-helpers";
import { ImportExportMenu } from ".";
import { ImportExportData } from "./base";

class TriggersExportMenu extends ImportExportMenu {
    #triggers: Collection<TriggerData>;

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        id: "pf2e-trigger-export-menu",
    };

    constructor(
        triggers: Collection<TriggerData>,
        options: DeepPartial<ApplicationConfiguration> = {}
    ) {
        setApplicationTitle(options, "export-menu.title");
        super(options);

        this.#triggers = triggers;

        for (const trigger of triggers) {
            const parent = trigger.isSubtrigger ? "subtrigger" : "trigger";

            const triggerResource = this.createResource({
                type: parent,
                id: trigger.id,
                name: trigger.label,
            });

            for (const node of trigger.nodes) {
                const values = R.pipe(
                    node.inputs,
                    R.values(),
                    R.map((input) => {
                        const value = input.value;
                        if (!R.isString(value)) return;

                        if (value.startsWith("Item")) {
                            return value;
                        }

                        if (
                            value.startsWith("Compendium.") &&
                            !value.startsWith("Compendium.pf2e")
                        ) {
                            return value;
                        }
                    }),
                    R.filter(R.isTruthy)
                );

                for (const value of values) {
                    const item = fromUuidSync<ItemPF2e>(value);
                    if (!item) continue;

                    const resource =
                        this.resources.item.get(value) ??
                        this.createResource({
                            type: "item",
                            id: value,
                            name: item.name,
                        });

                    resource[parent].add(trigger.id);
                    triggerResource.item.add(value);
                }
            }
        }
    }

    get canAddItem(): boolean {
        return true;
    }

    _getButtons(): { action: string; label: string }[] {
        return ["copy", "export", "cancel"].map((action) => ({
            action,
            label: localize("export-menu", action, "label"),
        }));
    }

    _onClickAction(event: PointerEvent, target: HTMLElement) {
        super._onClickAction(event, target);

        type Action = "copy" | "export" | "add-item" | "delete-item";

        switch (target.dataset.action as Action) {
            case "copy": {
                return this.#copyToClipboard();
            }

            case "export": {
                return this.#exportToFile();
            }

            case "add-item": {
                return this.#addItem();
            }

            case "delete-item": {
                const parent = htmlClosest(target, `[data-resource-id]`);
                const resourceId = parent?.dataset.resourceId as string;
                return this.#deleteItem(resourceId);
            }
        }
    }

    async #getExportData(): Promise<ImportExportData> {
        const triggers = R.pipe(
            [...this.resources.trigger, ...this.resources.subtrigger],
            R.map((resource) => {
                return resource.selected ? this.#triggers.get(resource.id)?.toObject() : undefined;
            }),
            R.filter(R.isTruthy)
        );

        const items = (
            await Promise.all(
                this.resources.item.map(async (resource) => {
                    const item = resource.selected
                        ? await fromUuid<ItemPF2e>(resource.id)
                        : undefined;

                    if (!(item instanceof Item)) return;

                    const source = item.toCompendium();

                    foundry.utils.setProperty(
                        source,
                        "_stats.compendiumSource",
                        getItemSourceId(item)
                    );

                    return source;
                })
            )
        ).filter(R.isTruthy);

        return { triggers, items };
    }

    async #exportToFile() {
        const data = await this.#getExportData();
        const stringified = JSON.stringify(data, null, 2);
        const filename = `${MODULE.id}-${Date.now()}`;

        foundry.utils.saveDataToFile(stringified, "text/json", `${filename}.json`);

        this.close();
    }

    async #copyToClipboard() {
        const data = await this.#getExportData();
        const stringified = JSON.stringify(data);

        game.clipboard.copyPlainText(stringified);
        info("export-menu.copy.confirm");

        this.close();
    }

    #deleteItem(id: string) {
        this.resources.item.delete(id);
        this.render();
    }

    async #addItem() {
        const result = await waitDialog<{ uuid: string }>({
            content: [
                {
                    type: "text",
                    inputConfig: {
                        name: "uuid",
                    },
                },
            ],
            i18n: "export-menu.add-item",
        });

        if (!result) return;

        const item = fromUuidSync<ItemPF2e>(result.uuid);
        if (!item) return;

        this.createResource({
            type: "item",
            id: result.uuid,
            name: item.name,
            added: true,
        });

        this.render();
    }
}

export { TriggersExportMenu };
