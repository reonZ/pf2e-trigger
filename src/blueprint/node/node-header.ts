import { R } from "module-helpers";
import { BlueprintNode } from "./blueprint-node";
import { BlueprintNodeLayout } from "./node-child";

class BlueprintNodeHeader extends BlueprintNodeLayout {
    #title: PreciseText;
    #subtitle: PreciseText | null;
    #icon: PIXI.Sprite | PreciseText | null;
    #innerWidth: number = 0;
    #innerHeight: number = 0;

    constructor(parent: BlueprintNode) {
        super(parent);

        this.#title = this.#createTitle();
        this.#subtitle = this.#createSubtitle();
        this.#icon = this.#createIcon();

        this.#positionChildren();
    }

    get padding(): Point {
        return { x: this.node.padding, y: 4 };
    }

    get spacing(): Point {
        return { x: 5, y: 0 };
    }

    get innerWidth(): number {
        return Math.max(this.#innerWidth, 100);
    }

    get outerHeight(): number {
        return this.#innerHeight + this.padding.y * 2;
    }

    get opacity(): number {
        return this.node.opacity;
    }

    paint(maxWidth: number): void {
        const maxTextWidth = maxWidth - (this.#title.x + this.padding.x);

        if (this.#title.width > maxTextWidth) {
            const mask = new PIXI.Graphics();

            mask.beginFill(0x555555);
            mask.drawRect(0, 0, maxTextWidth, this.#title.height);
            mask.endFill();

            this.#title.addChild(mask);
            this.#title.mask = mask;
        }

        this.beginFill(this.parent.headerColor, this.opacity);
        this.drawRect(0, 0, maxWidth, this.#innerHeight + this.padding.y * 2);
        this.endFill();
    }

    #positionChildren() {
        const padding = this.padding;
        const spacing = this.spacing;

        this.#innerWidth = 0;
        this.#innerHeight = 0;

        if (this.#icon instanceof PreciseText) {
            this.#icon.x = padding.x;
            this.#icon.y = padding.y + 1;

            this.#innerWidth = this.#icon.width + padding.x + spacing.x;
        } else if (this.#icon) {
            this.#icon.width = this.#title.height + padding.y * 2;
            this.#icon.height = this.#icon.width;

            this.#innerWidth = this.#icon.width - padding.x + spacing.x;
        }

        const offset = this.#icon ? this.#icon.x + this.#icon.width + spacing.x : padding.x;

        this.#title.x = offset;
        this.#title.y = padding.y;

        if (this.#subtitle) {
            this.#subtitle.x = offset + (this.#icon ? 0 : 2);
            this.#subtitle.y = this.#title.y + this.#title.height + spacing.y;

            this.#innerWidth += Math.min(Math.max(this.#title.width, this.#subtitle.width), 150);
            this.#innerHeight = this.#title.height + this.#subtitle.height + spacing.y;
        } else {
            this.#innerWidth += Math.min(this.#title.width, 150);
            this.#innerHeight = this.#title.height;
        }
    }

    #createTitle(): PreciseText {
        const titleEl = this.node.preciseText(this.parent.title ?? "");
        return this.addChild(titleEl);
    }

    #createSubtitle(): PreciseText | null {
        const subtitle = this.parent.subtitle;
        if (!subtitle) return null;

        const subtitleEl = this.parent.preciseText(subtitle, {
            fontStyle: "italic",
            fill: "d9d9d9",
            fontSize: this.parent.fontSize * 0.93,
        });

        return this.addChild(subtitleEl);
    }

    #createIcon(): PIXI.Sprite | PreciseText | null {
        const icon = this.parent.icon;
        if (!icon) return null;

        const iconEl = R.isString(icon) ? this.parent.fontAwesomeIcon(icon) : icon;
        return this.addChild(iconEl);
    }
}

export { BlueprintNodeHeader };
