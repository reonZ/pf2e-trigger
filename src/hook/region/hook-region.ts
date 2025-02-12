import { TriggerHook } from "hook/hook";

class RegionHook extends TriggerHook {
    get events(): NodeEventKey[] {
        return ["region-event"];
    }

    protected _activate(): void {}

    protected _disable(): void {}
}

export { RegionHook };
