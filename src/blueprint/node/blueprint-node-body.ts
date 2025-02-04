import { BlueprintEntry } from "blueprint/entry/blueprint-entry";
import { BlueprintNode } from "./blueprint-node";
import { BlueprintNodeLayout } from "./blueprint-node-layout";
import { R } from "module-helpers";
import { createBlueprintEntry } from "blueprint/entry/blueprint-entry-list";
import { BlueprintInputEntry } from "blueprint/entry/blueprint-entry-input/blueprint-entry-input";

class BlueprintNodeBody extends BlueprintNodeLayout {
    #entries: Collection<BlueprintEntry> = new Collection();
    #inputs: BlueprintEntry[] = [];
    #outputs: BlueprintEntry[] = [];
    #left: PIXI.Container | null = null;
    #right: PIXI.Container;

    constructor(node: BlueprintNode) {
        super(node);

        this.#left = this.#createInputs();
        this.#right = this.#createOutputs();
    }

    get padding(): Point {
        return { x: this.node.outerPadding, y: 6 };
    }

    get innerSpacing(): number {
        return this.node.entriesSpacing;
    }

    get spacing(): number {
        return 8;
    }

    get backgroundColor(): PIXI.Color | number {
        return this.node.backgroundColor;
    }

    get rowHeight(): number {
        return this.node.rowHeight;
    }

    get innerWidth(): number {
        return (this.#left?.width ?? 0) + this.innerSpacing + this.#right.width;
    }

    entries(category: "inputs"): Generator<BlueprintInputEntry, void, undefined>;
    entries(category: "outputs"): Generator<BlueprintEntry<"outputs">, void, undefined>;
    entries(category?: NodeEntryCategory): Generator<BlueprintEntry, void, undefined>;
    *entries(category?: NodeEntryCategory) {
        const collection =
            category === "outputs" ? this.#outputs : category ? this.#inputs : this.#entries;

        for (const entry of collection) {
            yield entry;
        }
    }

    getEntry(id: NodeEntryId): BlueprintEntry | undefined {
        return this.#entries.get(id);
    }

    paint(maxWidth: number): void {
        this.#right.x = maxWidth - (this.#right.width + (this.padding.x - 2));

        const height = Math.max(this.height, this.rowHeight);

        this.beginFill(this.backgroundColor, this.opacity);
        this.drawRect(0, 0, maxWidth, height + this.padding.y * 2);
        this.endFill();
    }

    #createInputs(): PIXI.Container | null {
        const schema = this.schema;
        if (!schema.inputs?.length) return null;

        const padding = this.padding;
        const rowHeight = this.rowHeight;

        let offset = padding.y + (this.node.isEvent ? rowHeight + this.spacing : 0);

        const left = new PIXI.Container();
        left.x = padding.x;

        for (const schemaInput of schema.inputs) {
            const input = createBlueprintEntry("inputs", this.node, schemaInput);
            input.y = offset;

            offset += rowHeight + this.spacing;

            this.#inputs.push(input);
            this.#entries.set(input.id, input);

            left.addChild(input);
        }

        return this.addChild(left);
    }

    #createOutputs(): PIXI.Container {
        const schema = this.schema;
        const rowHeight = this.rowHeight;

        let offset = this.padding.y;

        const right = new PIXI.Container();

        let maxWidth = 0;

        const outputs = R.pipe(
            schema.outputs,
            R.filter(R.isTruthy),
            R.map((schemaOutput) => {
                const output = createBlueprintEntry("outputs", this.node, schemaOutput);

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
