function getUnilimitedDuration(): TriggerDurationData {
    return {
        expiry: null,
        unit: "unlimited",
        value: -1,
    };
}

export { getUnilimitedDuration };
