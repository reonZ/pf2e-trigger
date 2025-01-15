import { BlueprintNode } from "../blueprint-node";

abstract class LogicBlueprintNode extends BlueprintNode {
    #filigram!: PreciseText;

    abstract get filigram(): string;

    get title(): string | null {
        return null;
    }

    get innerWidth(): number {
        return super.innerWidth + this.body.innerPadding * 2;
    }

    initialize(): void {
        this.#filigram = this.#createFiligram();
        super.initialize();
        this.#positionFiligram();
    }

    #positionFiligram() {
        const left =
            (this.body.left?.width ?? 0) + this.outerPadding + this.body.innerPadding * 1.5;

        this.#filigram.x = left - this.#filigram.width / 2;
        this.#filigram.y = this.height / 2 - this.#filigram.height / 2;
    }

    #createFiligram(): PreciseText {
        const filigram = this.fontAwesomeIcon(this.filigram, {
            fontSize: this.fontSize * 3,
        });

        return this.addChild(filigram);
    }
}

export { LogicBlueprintNode };
