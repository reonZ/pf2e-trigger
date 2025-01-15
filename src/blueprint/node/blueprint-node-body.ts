import { BlueprintNodeLayout } from "./blueprint-node-child";
import { NodeEntryId } from "@data/data-entry";
import { NodeEntryCategory, NodeEntryType } from "@schema/schema";
import { BlueprintEntry } from "./entry/blueprint-entry";
import { R } from "module-helpers";
import { createBlueprintEntry } from "./entry/blueprint-entry-list";

class BlueprintNodeBody extends BlueprintNodeLayout {
    #entries: Collection<BlueprintEntry> = new Collection();
    #inputs: BlueprintEntry[] = [];
    #outputs: BlueprintEntry[] = [];
    #left: PIXI.Container | null = null;
    #right!: PIXI.Container;

    get left(): PIXI.Container | null {
        return this.#left;
    }

    get padding(): Point {
        return { x: this.parent.outerPadding, y: 6 };
    }

    get innerPadding(): number {
        return 20;
    }

    get spacing(): number {
        return 8;
    }

    get backgroundColor(): PIXI.Color | number {
        return 0x000000;
    }

    get rowHeight(): number {
        return this.parent.fontSize * 1.16;
    }

    get innerWidth(): number {
        return (this.#left?.width ?? 0) + this.innerPadding + this.#right.width;
    }

    get opacity(): number {
        return this.node.opacity;
    }

    initialize(): void {
        this.#left = this.#createInputs();
        this.#right = this.#createOutputs();
    }

    paint(maxWidth: number): void {
        this.#right.x = maxWidth - (this.#right.width + (this.padding.x - 2));

        this.beginFill(this.backgroundColor, this.opacity);
        this.drawRect(0, 0, maxWidth, this.height + this.padding.y * 2);
        this.endFill();
    }

    *entries(category?: NodeEntryCategory): Generator<BlueprintEntry, void, undefined> {
        const collection =
            category === "outputs" ? this.#outputs : category ? this.#inputs : this.#entries;

        for (const entry of collection) {
            yield entry;
        }
    }

    getEntryFromType(category: NodeEntryCategory, type: NodeEntryType): BlueprintEntry | undefined {
        return this.#entries.find((entry) => entry.category === category && entry.type === type);
    }

    getEntryFromId(id: NodeEntryId): BlueprintEntry | undefined {
        return this.#entries.get(id);
    }

    #createInputs(): PIXI.Container | null {
        const schema = this.parent.schema;
        if (!schema.inputs?.length) return null;

        const padding = this.padding;
        const rowHeight = this.rowHeight;

        let offset = padding.y;

        const left = new PIXI.Container();
        left.x = padding.x;

        for (const schemaInput of schema.inputs) {
            const input = createBlueprintEntry("inputs", this, schemaInput);
            input.y = offset;

            offset += rowHeight + this.spacing;

            this.#inputs.push(input);
            this.#entries.set(input.id, input);

            left.addChild(input);
        }

        return this.addChild(left);
    }

    #createOutputs(): PIXI.Container {
        const schema = this.parent.schema;
        const rowHeight = this.rowHeight;

        let offset = this.padding.y;

        const right = new PIXI.Container();

        let maxWidth = 0;

        const outputs = R.pipe(
            schema.outputs,
            R.filter(R.isTruthy),
            R.map((schemaOutput) => {
                const output = createBlueprintEntry("outputs", this, schemaOutput);

                if (output.width > maxWidth) {
                    maxWidth = output.width;
                }

                return output;
            })
        );

        for (const output of outputs) {
            output.x = maxWidth - output.width;
            output.y = offset;

            offset += rowHeight + this.spacing;

            this.#outputs.push(output);
            this.#entries.set(output.id, output);

            right.addChild(output);
        }

        return this.addChild(right);
    }
}

export { BlueprintNodeBody };
