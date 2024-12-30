import {
    addListenerAll,
    error,
    htmlQuery,
    localize,
    R,
    templateLocalize,
    templatePath,
} from "module-helpers";
import {
    ACTIONS_MAP,
    EVENTS_MAP,
    Trigger,
    TriggerAction,
    TriggerInputs,
    TriggerInputValueType,
} from "../trigger.old";

abstract class Importer<TObject extends Trigger | TriggerAction> extends Application {
    #callback: (entries: TObject[]) => void;

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "pf2e-trigger-importer",
            template: templatePath("importer"),
            width: 600,
            height: 800,
            submitOnChange: false,
            submitOnClose: false,
            closeOnSubmit: false,
        });
    }

    constructor(callback: (entries: TObject[]) => void, options?: Partial<ApplicationOptions>) {
        super(options);

        this.#callback = callback;
    }

    abstract get key(): "trigger" | "action";

    get title() {
        return localize(`importer.${this.key}.title`);
    }

    abstract _validate(data: object[]): Error | void;

    getData(options?: Partial<FormApplicationOptions>) {
        return {
            key: this.key,
            i18n: templateLocalize("importer"),
        };
    }

    activateListeners($html: JQuery): void {
        const html = $html[0];

        addListenerAll(html, "[data-action]", (event, el) => {
            const eventAction = el.dataset.action as "import" | "cancel";

            switch (eventAction) {
                case "cancel": {
                    this.close();
                    break;
                }

                case "import": {
                    try {
                        const textarea = htmlQuery(html, "textarea")!;
                        const data = JSON.parse(textarea.value) as TObject[];

                        if (!R.isArray(data) || !data.every((entry) => R.isPlainObject(entry))) {
                            throw new Error("Imported data must be an array.");
                        }

                        this._validate(data);
                        this.#callback(data);
                    } catch (err) {
                        error("importer.error");
                        console.error(err);

                        this.#callback([]);
                    } finally {
                        this.close();
                    }

                    break;
                }
            }
        });
    }
}

function isInputType(value: unknown): value is TriggerInputValueType {
    return ["string", "number", "boolean", undefined].includes(typeof value);
}

function isInputRecord(obj: unknown): obj is TriggerInputs {
    return (
        R.isPlainObject(obj) &&
        R.entries(obj).every(([key, value]) => R.isString(key) && isInputType(value))
    );
}

function isUsedInputRecord(obj: unknown): obj is Record<string, boolean> {
    return (
        R.isPlainObject(obj) &&
        R.entries(obj).every(([key, value]) => R.isString(key) && R.isBoolean(value))
    );
}

class TriggerImporter extends Importer<Trigger> {
    get key(): "trigger" {
        return "trigger";
    }

    _validate(triggers: Trigger[]) {
        for (const trigger of triggers) {
            const throwError = (key: keyof Trigger) => {
                throw new Error(`Error while processing ${key} in event: ${trigger.event}`);
            };

            if (!R.isString(trigger.event) || !EVENTS_MAP.get(trigger.event)) {
                throw new Error(`Trigger event couldn't be found: ${trigger.event}`);
            }

            if (!isInputRecord(trigger.conditions)) {
                throwError("conditions");
            }

            if (!isUsedInputRecord(trigger.usedConditions)) {
                throwError("usedConditions");
            }

            ActionImporter._validateActions(trigger.actions);
        }
    }
}

class ActionImporter extends Importer<TriggerAction> {
    get key(): "action" {
        return "action";
    }

    static _validateActions(actions: TriggerAction[]) {
        for (const action of actions) {
            const throwError = (key: keyof TriggerAction) => {
                throw new Error(`Error while processing ${key} in action: ${action.type}`);
            };

            if (!R.isString(action.type) || !ACTIONS_MAP.get(action.type)) {
                throw new Error(`Trigger action couldn't be found: ${action.type}`);
            }

            if (!isInputRecord(action.options)) {
                throwError("options");
            }

            if ("linked" in action && !R.isBoolean(action.linked)) {
                throwError("linked");
            }

            if ("linkOption" in action && !isInputType(action.linkOption)) {
                throwError("linkOption");
            }

            if (!isUsedInputRecord(action.usedOptions)) {
                throwError("usedOptions");
            }
        }
    }

    _validate(actions: TriggerAction[]) {
        ActionImporter._validateActions(actions);
    }
}

export { ActionImporter, TriggerImporter };
