import { createEntryId, TriggerData, TriggerDataSource } from "data";
import {
    ApplicationConfiguration,
    error,
    ItemPF2e,
    ItemSourcePF2e,
    localize,
    MODULE,
    R,
    setApplicationTitle,
    waitDialog,
} from "module-helpers";
import { ImportExportData, ImportExportMenu } from "./base";
import { Blueprint } from "blueprint/blueprint";

class TriggersImportMenu extends ImportExportMenu {
    #blueprint: Blueprint;
    #data: ImportedData = {
        trigger: new Collection(),
        subtrigger: new Collection(),
        item: new Collection(),
    };

    static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        id: "pf2e-trigger-import-menu",
    };

    constructor(blueprint: Blueprint, options: DeepPartial<ApplicationConfiguration> = {}) {
        setApplicationTitle(options, "import-menu.title");
        super(options);

        this.#blueprint = blueprint;
    }

    get canAddItem(): boolean {
        return false;
    }

    _getButtons(): { action: string; label: string }[] {
        return ["import", "code", "file", "cancel"].map((action) => ({
            action,
            label: localize("import-menu", action, "title"),
        }));
    }

    _onClickAction(event: PointerEvent, target: HTMLElement) {
        super._onClickAction(event, target);

        type Action = "import" | "code" | "file";

        switch (target.dataset.action as Action) {
            case "import": {
                return this.#importSelected();
            }

            case "code": {
                return this.#importFromJSON();
            }

            case "file": {
                return this.#importFromFile();
            }
        }
    }

    #importSelected() {
        const triggers: TriggerDataSource[] = R.pipe(
            ["trigger", "subtrigger"] as const,
            R.flatMap((parent) => {
                return R.pipe(
                    this.resources[parent].contents,
                    R.map((resource) => {
                        return resource.selected
                            ? this.#data[parent].get(resource.id)?.toObject()
                            : undefined;
                    }),
                    R.filter(R.isTruthy)
                );
            })
        );

        const itemSources: ItemSourcePF2e[] = R.pipe(
            this.resources.item.contents,
            R.map((resource) => {
                return resource.selected ? this.#data.item.get(resource.id)?.toObject() : undefined;
            }),
            R.filter(R.isTruthy)
        );

        getDocumentClass("Item").createDocuments(itemSources, { keepId: true });

        this.#blueprint.addTriggers(triggers);

        this.close();
    }

    #generateData(raw: unknown): ImportedData | undefined {
        try {
            const data = (R.isString(raw) ? JSON.parse(raw) : undefined) as Maybe<ImportExportData>;

            if (
                !R.isPlainObject(data) ||
                (data.triggers && !R.isArray(data.triggers)) ||
                (data.items && !R.isArray(data.items))
            ) {
                throw new Error("Provided triggers data is invalid.");
            }

            const Item = getDocumentClass("Item");
            const itemIds: Record<string, string> = {};
            const items: ItemPF2e[] = [];

            for (const itemSource of data.items ?? []) {
                if (!R.isPlainObject(itemSource)) return;

                const itemId = foundry.utils.randomID();
                const sourceId = foundry.utils.getProperty(itemSource, "_stats.compendiumSource");
                const newSourceId = `Item.${itemId}`;

                // we generate new _id and sourceId
                foundry.utils.mergeObject(itemSource, {
                    _id: itemId,
                    "_stats.compendiumSource": newSourceId,
                });

                const item = new Item(itemSource);
                if (!item) return;

                items.push(item);

                if (sourceId) {
                    // we cache the old sourceId with the new one
                    itemIds[sourceId] = newSourceId;
                }
            }

            const subtriggerIds: Record<string, string> = {};
            const [subtriggers, triggers] = R.pipe(
                data.triggers ?? [],
                R.map((triggerData) => {
                    const trigger = new TriggerData(triggerData);
                    if (trigger.invalid) return;

                    for (const node of trigger.nodes) {
                        for (const [key, { value }] of R.entries(node.inputs)) {
                            if (!R.isString(value)) continue;

                            const replaceId = itemIds[value];
                            if (!replaceId) continue;

                            // we convert item sourceId with new generated ones from items packaged with this import
                            const entryId = createEntryId(node, "inputs", key);
                            node.setValue(entryId, replaceId);
                        }
                    }

                    // we cache subtriggers old id while generating a new one to convert them on trigger nodes
                    if (trigger.isSubtrigger) {
                        const newId = foundry.utils.randomID();

                        subtriggerIds[trigger.id] = newId;

                        // we also enable the subtrigger
                        return trigger.clone({
                            _id: newId,
                            enabled: true,
                        });
                    }

                    // we generate a new id to avoid conflicts and enable the trigger
                    return trigger.clone({
                        _id: foundry.utils.randomID(),
                        enabled: true,
                    });
                }),
                R.filter(R.isTruthy),
                R.partition((trigger) => trigger.isSubtrigger)
            );

            for (const trigger of triggers) {
                for (const node of trigger.nodes) {
                    if (!node.isSubtriggerNode) continue;

                    const replaceId = subtriggerIds[node.target as string];
                    if (!replaceId) continue;

                    // we replace the target id with the newly generated one from subtriggers packed with this import
                    node.update({ target: replaceId });
                }
            }

            return {
                trigger: new Collection(triggers.map((x) => [x.id, x] as const)),
                subtrigger: new Collection(subtriggers.map((x) => [x.id, x] as const)),
                item: new Collection(items.map((x) => [x.id, x] as const)),
            };
        } catch (err) {
            error("import-menu.import.error");
            MODULE.error(err);
        }
    }

    #importData(raw: unknown) {
        const data = this.#generateData(raw);
        if (!data) return;

        this.#data = data;

        for (const parent of ["trigger", "subtrigger"] as const) {
            for (const trigger of data[parent]) {
                this.createResource({
                    type: parent,
                    id: trigger.id,
                    name: trigger.label,
                    selected: true,
                });
            }
        }

        for (const item of data.item) {
            this.createResource({
                type: "item",
                id: item.id,
                name: item.name,
                selected: true,
            });
        }

        this.render();
    }

    async #importFromJSON() {
        const result = await waitDialog<{ code: string }>({
            i18n: "import-menu.code",
            content: `<textarea name="code"></textarea>`,
            focus: "code",
        });

        if (result && result.code) {
            this.#importData(result.code);
        }
    }

    async #importFromFile() {
        const result = await waitDialog<{ file: File }>({
            i18n: "import-menu.file",
            content: `<input type="file" name="file" accept=".json">`,
            focus: "code",
        });

        if (result && result.file) {
            const content = await foundry.utils.readTextFromFile(result.file);
            this.#importData(content);
        }
    }
}

type ImportedData = {
    trigger: Collection<TriggerData>;
    subtrigger: Collection<TriggerData>;
    item: Collection<ItemPF2e>;
};

export { TriggersImportMenu };
