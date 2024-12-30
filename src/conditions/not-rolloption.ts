import { createConditionEntry } from ".";

function notRollOptionCondition() {
    return createConditionEntry(
        {
            key: "not-rolloption",
            type: "text",
        },
        ({ actor }, value) => {
            const rolloptionsDomains = Object.values(actor.rollOptions) as Record<
                string,
                boolean
            >[];

            for (const rollOptions of rolloptionsDomains) {
                if (rollOptions[value]) return false;
            }

            return true;
        },
        {
            allowSource: true,
        }
    );
}

export { notRollOptionCondition };
