import { R } from "module-helpers";
import { BlueprintNode } from "./blueprint-node";
import { BlueprintNodeLayout } from "./blueprint-node-layout";

class BlueprintNodeHeader extends BlueprintNodeLayout {
    #title: PreciseText;
    #subtitle: PreciseText | null;
    #icon: PIXI.Sprite | PreciseText | null;
    #innerWidth: number = 0;
    #innerHeight: number = 0;

    constructor(node: BlueprintNode) {
        super(node);

        this.#icon = this.#createIcon();
        this.#title = this.#createTitle();
        this.#subtitle = this.#createSubtitle();

        this.#positionChildren();
    }

    get icon(): PIXI.Sprite | string | null {
        return this.node.icon;
    }

    get title(): string {
        return this.node.title!;
    }

    get subtitle(): string | null {
        return this.node.subtitle;
    }

    get minInnerWidth(): number {
        return 100;
    }

    get maxInnerWidth(): number {
        return 200;
    }

    get innerWidth(): number {
        return Math.clamp(this.#innerWidth, this.minInnerWidth, this.maxInnerWidth);
    }

    get padding(): Point {
        return { x: this.node.outerPadding, y: 4 };
    }

    get spacing(): Point {
        return { x: 5, y: 0 };
    }

    get outerHeight(): number {
        return this.#innerHeight + this.padding.y * 2;
    }

    paint(maxWidth: number): void {
        const maxTextWidth = maxWidth - (this.#title.x + this.padding.x);

        if (this.#title.width > maxTextWidth) {
            const mask =
                (this.#title.mask as PIXI.Graphics) ?? this.#title.addChild(new PIXI.Graphics());

            mask.beginFill(0x555555);
            mask.drawRect(0, 0, maxTextWidth, this.#title.height);
            mask.endFill();

            this.#title.mask = mask;
        }

        this.beginFill(this.node.headerColor, this.opacity);
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

            this.#innerWidth += Math.max(this.#title.width, this.#subtitle.width);
            this.#innerHeight = this.#title.height + this.#subtitle.height + spacing.y;
        } else {
            this.#innerWidth += this.#title.width;
            this.#innerHeight = this.#title.height;
        }
    }

    #createTitle(): PreciseText {
        const titleEl = this.node.preciseText(this.title ?? "");
        return this.addChild(titleEl);
    }

    #createSubtitle(): PreciseText | null {
        const subtitle = this.subtitle;
        if (!subtitle) return null;

        const subtitleEl = this.node.preciseText(subtitle, {
            fontStyle: "italic",
            fill: "d9d9d9",
            fontSize: this.node.fontSize * 0.93,
        });

        return this.addChild(subtitleEl);
    }

    #createIcon(): PIXI.Sprite | PreciseText | null {
        const icon = this.node.icon;
        if (!icon) return null;

        const iconEl = R.isString(icon) ? this.node.fontAwesomeIcon(icon) : icon;
        return this.addChild(iconEl);
    }
}

export { BlueprintNodeHeader };
