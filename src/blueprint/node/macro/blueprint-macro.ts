import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { MacroPF2e, R, localize } from "module-helpers";
import { BlueprintNode } from "../blueprint-node";
import { makeCustomNode } from "../blueprint-node-custom";

class MacroBlueprintNode extends makeCustomNode(BlueprintNode) {
    get icon(): string | PIXI.Sprite | null {
        const macro = this.macro;
        return macro === null
            ? "\uf127"
            : macro && R.isString(macro.img)
            ? PIXI.Sprite.from(macro.img)
            : "\uf121";
    }

    get title(): string {
        return this.macro?.name ?? localize("node.macro.header");
    }

    get subtitle(): string | null {
        return null;
    }

    get headerColor(): number {
        return 0xa1733f;
    }

    get context() {
        return ["add-input", "add-output", ...super.context];
    }

    get macro(): Maybe<MacroPF2e | CompendiumIndexData> {
        const uuid = this.data.inputs.uuid?.value;
        if (!R.isString(uuid) || !uuid.trim()) return;

        const macro = fromUuidSync<MacroPF2e | CompendiumIndexData>(uuid);
        return macro instanceof foundry.abstract.Document && macro.type === "script"
            ? macro
            : R.isPlainObject(macro) && !macro.type
            ? macro
            : null;
    }

    getConnectionContext(entry: BlueprintEntry): string[] {
        const context = super.getConnectionContext(entry);
        return entry.key === "uuid" ? context.filter((x) => x !== "remove") : context;
    }

    _onValueUpdate(key: string): boolean {
        if (key === "uuid") {
            this.refreshHeader();
        }
        return true;
    }
}

export { MacroBlueprintNode };
