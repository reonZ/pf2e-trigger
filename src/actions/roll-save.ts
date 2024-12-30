import { ZeroToThree } from "module-helpers";
import { createActionEntry } from ".";

function rollSaveAction() {
    return createActionEntry(
        "roll-save",
        "fa-solid fa-dice-d20",
        [
            {
                key: "save",
                type: "select",
                options: [
                    { value: "fortitude", label: "PF2E.SavesFortitude" },
                    { value: "reflex", label: "PF2E.SavesReflex" },
                    { value: "will", label: "PF2E.SavesWill" },
                ],
            },
            { key: "dc", type: "number", default: 15, min: 5 },
            {
                key: "logic",
                type: "select",
                default: ">",
                ifLinked: true,
                options: ["=", ">", "<"],
            },
            {
                key: "success",
                type: "select",
                default: "1",
                ifLinked: true,
                options: [
                    {
                        value: "3",
                        label: "PF2E.Check.Result.Degree.Check.criticalSuccess",
                    },
                    {
                        value: "2",
                        label: "PF2E.Check.Result.Degree.Check.success",
                    },
                    {
                        value: "1",
                        label: "PF2E.Check.Result.Degree.Check.failure",
                    },
                    {
                        value: "0",
                        label: "PF2E.Check.Result.Degree.Check.criticalFailure",
                    },
                ],
            },
        ] as const,
        async (target, options, cached, extras) => {
            const actorSave = target.actor.getStatistic(options.save);
            if (!actorSave) return false;

            const roll = await actorSave.roll({ dc: options.dc });
            if (!roll) return false;

            const logic = (options.logic ?? "=") as "=" | "<" | ">";
            const threshold = Number(options.success ?? "2") as ZeroToThree;
            const success = roll.degreeOfSuccess ?? 2;

            return logic === ">"
                ? success > threshold
                : logic === "<"
                ? success < threshold
                : success === threshold;
        }
    );
}

export { rollSaveAction };
