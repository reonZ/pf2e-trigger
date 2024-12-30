import { createConditionEntry } from ".";

function hasItemCondition() {
    return createConditionEntry(
        {
            key: "has-item",
            type: "uuid",
        },
        ({ actor }, value, { hasItem }) => {
            return !!hasItem(actor, value);
        },
        {
            allowSource: true,
        }
    );
}

export { hasItemCondition };
