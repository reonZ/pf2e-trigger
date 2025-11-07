import { TriggerData } from "data";
import {
    ApplicationConfiguration,
    getItemFromUuid,
    getItemSourceId,
    htmlClosest,
    info,
    ItemPF2e,
    localize,
    MODULE,
    R,
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

    get title(): string {
        return localize("export-menu.title");
    }

    get canAddItem(): boolean {
        return true;
    }

    get canKeepIds(): boolean {
        return false;
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

        const action = target.dataset.action as Action;

        if (action === "add-item") {
            this.#addItem();
        } else if (action === "copy") {
            this.#copyToClipboard();
        } else if (action === "delete-item") {
            const parent = htmlClosest(target, `[data-resource-id]`);
            const resourceId = parent?.dataset.resourceId as string;
            this.#deleteItem(resourceId);
        } else if (action === "export") {
            this.#exportToFile();
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
                    const item = resource.selected ? await getItemFromUuid(resource.id) : undefined;
                    if (!item) return;

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
        const stringified = JSON.stringify(data);
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
