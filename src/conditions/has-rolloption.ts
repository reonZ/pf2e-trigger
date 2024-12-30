import { createConditionEntry } from ".";

function hasRollOptionCondition() {
    return createConditionEntry(
        {
            key: "has-rolloption",
            type: "text",
        },
        ({ actor }, value) => {
            const rolloptionsDomains = Object.values(actor.rollOptions) as Record<
                string,
                boolean
            >[];

            for (const rollOptions of rolloptionsDomains) {
                if (rollOptions[value]) return true;
            }

            return false;
        },
        {
            allowSource: true,
        }
    );
}

export { hasRollOptionCondition };
