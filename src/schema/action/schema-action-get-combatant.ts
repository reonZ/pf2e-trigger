const getCombatantSchema = {
    in: true,
    outs: [{ key: "out" }],
    variables: [{ key: "combatant", type: "target" }],
} as const;

export { getCombatantSchema };
