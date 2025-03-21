import { TriggerHook } from "hook/hook";

class RegionHook extends TriggerHook<"region-event"> {
    get events(): ["region-event"] {
        return ["region-event"];
    }

    protected _activate(): void {}

    protected _disable(): void {}
}

export { RegionHook };
