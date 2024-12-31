import { isInstanceOf, rollDamageFromFormula } from "module-helpers";
import { createActionEntry } from ".";

function rollDamageAction() {
    return createActionEntry(
        "roll-damage",
        "fa-solid fa-sword",
        [
            { key: "formula", type: "text" },
            {
                key: "origin",
                type: "select",
                options: ["self", "source"],
                default: "source",
                ifHasSource: true,
            },
            { key: "item", type: "uuid", optional: true },
        ] as const,
        async (target, options, cached, extras) => {
            const origin = (options.origin === "source" && extras.source) || target;

            const item = (() => {
                if (!options.item) return;

                const item = cached.hasItem(origin.actor, options.item);
                return isInstanceOf(item, "ItemPF2e") ? item : undefined;
            })();

            const message = await rollDamageFromFormula(options.formula, {
                item,
                target,
                origin,
            });

            return !!message;
        }
    );
}

export { rollDamageAction };
