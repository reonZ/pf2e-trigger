import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { getNodeEntryValueList, isNonNullNodeEntry } from "data/data-entry";
import { R, localize, render, templateLocalize, waitDialog } from "module-helpers";
import { BlueprintNode } from "./blueprint-node";

function makeCustomNode<TBase extends AbstractConstructorOf<BlueprintNode>>(
    BaseClass: TBase
): TBase & AbstractConstructorOf<CustomBlueprintNode> {
    abstract class CustomBlueprintNode extends BaseClass {
        getConnectionContext(entry: BlueprintEntry): string[] {
            const entryKey = entry.key;

            if (this.data.custom[entry.category].some((x) => x.key === entryKey)) {
                return [...super.getConnectionContext(entry), "remove-connection"];
            }

            return super.getConnectionContext(entry);
        }

        async addEntry(
            category: NodeEntryCategory,
            { valueLabel, noType, types }: AddEntryOptions = {}
        ) {
            const usedTypes = noType
                ? undefined
                : types?.map((type) => {
                      return {
                          value: type,
                          label: localize("node.entry", type),
                      };
                  }) ?? getNodeEntryValueList();

            const result = await waitDialog<{
                name: string;
                type?: CustomNodeEntryType;
                value?: string;
            }>(
                {
                    title: localize("add-entry", category),
                    focus: `[name="${valueLabel ? "value" : "name"}"]`,
                    content: await render("add-entry", {
                        types: usedTypes,
                        valueLabel,
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

            if (!result || (valueLabel && !result.value?.trim())) return;

            const entries = this.data.custom[category] as NodeSchemaEntry[];
            const label = (() => {
                if (valueLabel) {
                    return result.name.trim() || result.value;
                }

                const label = result.name.trim();
                if (label || !result.type) {
                    return label;
                }

                const name = localize("node.entry", result.type);
                const regex = new RegExp(`${name} (\\d+)`);
                const count = R.pipe(
                    entries as { label: string }[],
                    R.map((entry) =>
                        entry.label === name ? 1 : Number(regex.exec(entry.label)?.[1]) || 0
                    ),
                    R.firstBy([R.identity(), "desc"])
                );

                return (count ?? 0) >= 1 ? `${name} ${(count ?? 0) + 1}` : name;
            })();

            const entry: NodeSchemaEntry = {
                key: result.value?.trim().replace(/\./g, "|") ?? fu.randomID(),
                label,
            };

            if (result.type) {
                (entry as NodeSchemaInput | NodeSchemaVariable).type = result.type;
            }

            if (category === "inputs" && isNonNullNodeEntry(entry)) {
                (entry as NodeSchemaInput).field = true;
            }

            entries.push(entry);
            this.refresh(true);
        }

        removeEntry(entry: BlueprintEntry) {
            entry.removeConnections(true);

            this.blueprint.deleteVariables(this.id, { variableKey: entry.key });
            this.data.custom[entry.category].findSplice((x) => x.key === entry.key);

            this.refresh(true);
        }

        async _onContext(context: string): Promise<void> {
            switch (context) {
                case "add-input": {
                    return this.addEntry("inputs");
                }

                case "add-output": {
                    return this.addEntry("outputs");
                }

                default: {
                    return super._onContext(context);
                }
            }
        }

        async _onConnectionContext(entry: BlueprintEntry, context: string) {
            switch (context) {
                case "remove-connection": {
                    return this.removeEntry(entry);
                }

                default: {
                    return super._onConnectionContext(entry, context);
                }
            }
        }
    }

    return CustomBlueprintNode;
}

interface CustomBlueprintNode {
    addEntry(category: NodeEntryCategory, options?: AddEntryOptions): Promise<void>;
    getConnectionContext(entry: BlueprintEntry): string[];
    removeEntry(entry: BlueprintEntry): void;

    _onContext(context: string): Promise<void>;
    _onConnectionContext(entry: BlueprintEntry, context: string): Promise<void>;
}

type AddEntryOptions = {
    valueLabel?: string | undefined;
    noType?: boolean | undefined;
    types?: CustomNodeEntryType[];
};

export { makeCustomNode };
