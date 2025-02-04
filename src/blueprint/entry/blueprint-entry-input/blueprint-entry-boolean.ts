import { BlueprintInputEntry } from "./blueprint-entry-input";

class BlueprintBooleanEntry extends BlueprintInputEntry<"boolean"> {
    initialize() {
        this.#drawField();
        super.initialize();
    }

    refreshFieldText() {
        const field = this.fieldComponent;
        if (!field) return;

        if (this) {
            this.#drawField();
        }
    }

    protected _onInputFocus() {
        this.value = !this.value;
    }

    protected _createLabel(): PIXI.Container {
        const wrapper = new PIXI.Container();

        const textEl = wrapper.addChild(super._createLabel());
        this.verticalAlign(textEl);

        const height = this.rowHeight;

        const field = new PIXI.Graphics();
        field.x = textEl.x + textEl.width + this.spacing;

        field.name = "field";
        field.eventMode = "static";
        field.cursor = "pointer";
        field.hitArea = new PIXI.Rectangle(0, 0, height, height);
        field.on("pointerdown", (event) => event.stopPropagation());

        wrapper.addChild(field);

        return wrapper;
    }

    #drawField() {
        const field = this.fieldComponent;
        const height = this.rowHeight;

        field.clear();
        field.lineStyle({ color: 0xffffff, width: 1 });
        if (this.value === true) {
            field.beginFill(0x940404, 0.5);
        }
        field.drawRect(0, 1, height, height);
    }
}

interface BlueprintBooleanEntry extends BlueprintInputEntry<"boolean"> {
    get schema(): NodeSchemaBoolean;
}

export { BlueprintBooleanEntry };
