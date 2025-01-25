import { TriggerData } from "data/data-trigger";
import { R, localize, render, subLocalize, templateLocalize, waitDialog } from "module-helpers";
import { EventNodeKey, getEventKeys } from "schema/schema-list";

function getEvents(trigger?: TriggerData | null) {
    return R.pipe(
        getEventKeys(),
        R.map((key) => {
            if (trigger?.event.key === key) return;

            return {
                value: key,
                label: localize("node.event", key, "title"),
            };
        }),
        R.filter(R.isTruthy),
        R.sortBy(R.prop("label"))
    );
}

async function openAddTriggerDialog(trigger?: TriggerData | null, convert?: boolean) {
    const events = !trigger || !!convert ? getEvents(convert ? trigger : undefined) : undefined;
    const i18n = subLocalize(
        trigger ? (convert ? "convert-trigger" : "edit-trigger") : "add-trigger"
    );

    return waitDialog<{ name: string; event: EventNodeKey }>(
        {
            title: i18n("title"),
            content: await render("add-trigger", {
                events,
                convert,
                i18n: templateLocalize("add-trigger"),
            }),
            yes: {
                label: i18n("yes"),
                icon: "fa-solid fa-check",
            },
            no: {
                label: localize("add-trigger.no"),
                icon: "fa-solid fa-xmark",
            },
        },
        { animation: false }
    );
}

export { openAddTriggerDialog };
