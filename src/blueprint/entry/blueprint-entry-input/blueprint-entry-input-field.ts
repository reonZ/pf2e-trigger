import { BlueprintInputEntry } from "./blueprint-entry-input";

abstract class BlueprintInputFieldEntry<
    TEntry extends NonNullNodeEntryType = NonNullNodeEntryType
> extends BlueprintInputEntry<TEntry> {
    protected abstract _createHtmlInput(): HTMLInputElement;

    protected async _onInputFocus() {
        const target = this.fieldComponent;
        const bounds = target.getBounds();
        const el = this._createHtmlInput();
        const viewBounds = this.blueprint.view.getBoundingClientRect();

        target.children[0].visible = false;

        Object.assign(el.style, {
            position: "absolute",
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            left: `${bounds.x + viewBounds.x}px`,
            top: `${bounds.y + viewBounds.y}px`,
            fontSize: `${this.inputFontSize}px`,
            borderColor: "transparent",
            zIndex: "2147483647",
            color: "white",
        } satisfies Partial<CSSStyleDeclaration>);

        document.body.appendChild(el);

        el.focus();
        el.select();

        const onBlur = () => {
            this.value = el.value.trim() as ExtractEntryType<TEntry>;
            target.children[0].visible = true;
            el.remove();
        };

        el.addEventListener("blur", onBlur);

        el.addEventListener("keydown", (event) => {
            if (!["Enter", "Escape"].includes(event.key)) return;

            event.preventDefault();
            event.stopPropagation();

            switch (event.key) {
                case "Enter": {
                    el.blur();
                    break;
                }

                case "Escape": {
                    el.removeEventListener("blur", onBlur);
                    el.remove();
                    target.children[0].visible = true;
                    break;
                }
            }
        });
    }
}

export { BlueprintInputFieldEntry };
