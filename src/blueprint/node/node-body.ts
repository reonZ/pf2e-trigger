import { NodeEntryCategory, NodeEntryId, NodeEntryType } from "@node/trigger-node";
import { R } from "module-helpers";
import { BlueprintNode } from "./blueprint-node";
import { BlueprintNodeLayout } from "./node-child";
import { BlueprintNodeEntry } from "./node-entry";

class BlueprintNodeBody extends BlueprintNodeLayout {
    #entries: Collection<BlueprintNodeEntry> = new Collection();
    #inputs: BlueprintNodeEntry[] = [];
    #outputs: BlueprintNodeEntry[] = [];
    #left: PIXI.Container | null;
    #right: PIXI.Container;

    constructor(parent: BlueprintNode) {
        super(parent);

        this.#left = this.#createInputs();
        this.#right = this.#createOutputs();
    }

    get padding(): Point {
        return { x: this.parent.padding, y: 6 };
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

    *entries(category?: NodeEntryCategory): Generator<BlueprintNodeEntry, void, undefined> {
        const collection =
            category === "outputs" ? this.#outputs : category ? this.#inputs : this.#entries;

        for (const entry of collection) {
            yield entry;
        }
    }

    getEntryFromId(id: NodeEntryId): BlueprintNodeEntry | undefined {
        return this.#entries.get(id);
    }

    getEntryFromType(
        category: NodeEntryCategory,
        type: NodeEntryType | undefined
    ): BlueprintNodeEntry | undefined {
        return this.#entries.find((entry) => entry.category === category && entry.type === type);
    }

    paint(maxWidth: number): void {
        this.#right.x = maxWidth - (this.#right.width + (this.padding.x - 2));

        this.beginFill(this.backgroundColor, this.opacity);
        this.drawRect(0, 0, maxWidth, this.height + this.padding.y * 2);
        this.endFill();
    }

    #createInputs(): PIXI.Container | null {
        const schema = this.parent.schema;
        if (!schema.inputs?.length) return null;

        const padding = this.padding;
        const rowHeight = this.rowHeight;

        let offset = padding.y;

        const inputsEl = new PIXI.Container();
        inputsEl.x = padding.x;

        for (const schemaInput of schema.inputs) {
            const input = new BlueprintNodeEntry(this, "inputs", schemaInput);
            input.y = offset;

            offset += rowHeight + this.spacing;

            this.#inputs.push(input);
            this.#entries.set(input.id, input);

            inputsEl.addChild(input);
        }

        return this.addChild(inputsEl);
    }

    #createOutputs(): PIXI.Container {
        const schema = this.parent.schema;
        const rowHeight = this.rowHeight;

        let offset = this.padding.y;

        const outputsEl = new PIXI.Container();

        const outputs = R.pipe(
            schema.outputs,
            R.filter(R.isTruthy),
            R.map((schemaOutput) => new BlueprintNodeEntry(this, "outputs", schemaOutput))
        );

        const maxWidth = R.pipe(
            outputs,
            R.map((output) => output.width),
            R.firstBy([R.identity(), "desc"])
        ) as number;

        for (const output of outputs) {
            output.x = maxWidth - output.width;
            output.y = offset;

            offset += rowHeight + this.spacing;

            this.#outputs.push(output);
            this.#entries.set(output.id, output);

            outputsEl.addChild(output);
        }

        return this.addChild(outputsEl);
    }
}

export { BlueprintNodeBody };
