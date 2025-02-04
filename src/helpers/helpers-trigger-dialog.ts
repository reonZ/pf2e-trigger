import { R, localize, render, templateLocalize, waitDialog } from "module-helpers";
import { getEventKeys } from "schema/schema-list";

async function openTriggerDialog(
    type: "add" | "add-sub"
): Promise<{ name: string; event: NodeEventKey } | false | null>;
async function openTriggerDialog(
    type: "edit" | "convert",
    trigger: TriggerData
): Promise<{ name: string; event: NodeEventKey } | false | null>;
async function openTriggerDialog(
    type: "add" | "edit" | "convert" | "add-sub",
    trigger?: TriggerData
): Promise<{ name: string; event: NodeEventKey } | false | null> {
    const placeholder = trigger?.id;
    const name = trigger?.name === placeholder ? "" : trigger?.name ?? "";
    const events = ["add", "convert"].includes(type) ? getEvents(trigger) : undefined;

    return waitDialog<{ name: string; event: NodeEventKey }>(
        {
            title: localize("trigger-dialog", type, "title"),
            content: await render("trigger-dialog", {
                events,
                name: type === "convert" ? undefined : { value: name, placeholder },
                i18n: templateLocalize("trigger-dialog"),
            }),
            yes: {
                label: localize("trigger-dialog", type, "yes"),
                icon: "fa-solid fa-check",
            },
            no: {
                label: localize("trigger-dialog.no"),
                icon: "fa-solid fa-xmark",
            },
        },
        { animation: false }
    );
}

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

export { openTriggerDialog };
