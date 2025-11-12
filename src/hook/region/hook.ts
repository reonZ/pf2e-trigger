import { TriggerHook } from "hook";

class RegionHook extends TriggerHook {
    get eventKeys(): ["region-event"] {
        return ["region-event"];
    }

    activate(): void {}

    disable(): void {}
}

const REGION_HOOK = new RegionHook();

export { REGION_HOOK };
