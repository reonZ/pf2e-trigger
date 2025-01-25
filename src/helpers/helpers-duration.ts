import { DurationData } from "module-helpers";

function getUnilimitedDuration(): DurationData {
    return {
        expiry: null,
        unit: "unlimited",
        value: -1,
    };
}

export { getUnilimitedDuration };
