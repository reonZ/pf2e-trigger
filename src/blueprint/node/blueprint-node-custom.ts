import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { getNodeEntryValueList } from "data/data-entry";
import { R, localize, render, templateLocalize, waitDialog } from "module-helpers";
import { BlueprintNode } from "./blueprint-node";

function makeCustomNode<TBase extends AbstractConstructorOf<BlueprintNode>>(BaseClass: TBase) {
    abstract class CustomBlueprintNode extends BaseClass {
        getConnectionContext(entry: BlueprintEntry): string[] {
            if (entry.isBridgeEntry()) {
                return super.getConnectionContext(entry);
            }
            return [...super.getConnectionContext(entry), "remove"];
        }

        async addEntry(category: NodeEntryCategory) {
            const types = getNodeEntryValueList();

            const result = await waitDialog<{ name: string; type: CustomNodeEntryType }>(
                {
                    title: localize("add-entry", category),
                    content: await render("add-entry", {
                        types,
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

            if (!result) return;

            const entries = this.data.custom[category] as NodeSchemaEntry[];
            const label = (() => {
                const label = result.name.trim();
                if (label) {
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

            entries.push({
                type: result.type,
                key: fu.randomID(),
                label,
            });

            this.refresh(true);
        }

        removeEntry(entry: BlueprintEntry) {
            entry.removeConnections(true);

            this.blueprint.deleteVariables(this.id, { variableKey: entry.key });
            this.data.custom[entry.category].findSplice((x) => x.key === entry.key);

            this.refresh(true);
        }

        protected async _onContext(context: string): Promise<void> {
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

        protected async _onConnectionContext(entry: BlueprintEntry, context: string) {
            switch (context) {
                case "remove": {
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

export { makeCustomNode };
