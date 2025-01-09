import { Blueprint } from "@blueprint/blueprint";
import { htmlQuery, subLocalize, templatePath } from "module-helpers";

const localize = subLocalize("triggers-menu");

class TriggersMenu extends FormApplication {
    #blueprint: Blueprint | null = null;

    static get defaultOptions(): FormApplicationOptions {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "pf2e-trigger-triggers-menu",
            title: localize("title"),
            template: templatePath("triggers-menu"),
            submitOnChange: false,
            submitOnClose: false,
            closeOnSubmit: true,
            scrollY: [".triggers"],
            left: 5,
            top: 5,
        } satisfies Partial<FormApplicationOptions>);
    }

    render(force?: boolean, options?: RenderOptions): this {
        this.#blueprint?.destroy(true, true);
        this.#blueprint = null;
        return super.render(force, options);
    }

    async close(options?: { force?: boolean }): Promise<void> {
        this.#blueprint?.destroy(true, true);
        this.#blueprint = null;
        return super.close(options);
    }

    protected async _render(force?: boolean, options?: RenderOptions): Promise<void> {
        await super._render(force, options);
        this.#createPixiApplication();
    }

    getData(options?: Partial<FormApplicationOptions>): BlueprintMenuData {
        return {};
    }

    activateListeners(html: JQuery): void {}

    #createPixiApplication() {
        requestAnimationFrame(() => {
            const parent = htmlQuery(this.element[0], ".window-content");
            if (parent) {
                this.#blueprint = new Blueprint(parent);
            }
        });
    }

    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
        throw new Error("Method not implemented.");
    }
}

type BlueprintMenuData = {};

export { TriggersMenu };
