import { createConditionEntry } from ".";

function notItemCondition() {
    return createConditionEntry(
        {
            key: "not-item",
            type: "uuid",
        },
        ({ actor }, value, { hasItem }) => {
            return !hasItem(actor, value);
        },
        {
            allowSource: true,
        }
    );
}

export { notItemCondition };
