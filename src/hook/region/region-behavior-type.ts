import { localize, R, RegionEventPF2e } from "module-helpers";
import fields = foundry.data.fields;
import { REGION_HOOK } from "./hook";
import { Trigger, TriggerPreOptions } from "trigger";

class PF2eTriggerBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
    declare id: string;

    static defineSchema() {
        return {
            events: this._createEventsField({
                events: R.values(CONST.REGION_EVENTS).filter((event) => event.startsWith("token")),
            }),
            id: new fields.StringField({
                initial: "",
                nullable: false,
                label: localize("region.id"),
                required: true,
            }),
        };
    }

    protected override async _handleRegionEvent(event: RegionEventPF2e): Promise<void> {
        if (!game.user.isActiveGM || !("token" in event.data)) return;

        const token = event.data.token;
        const actor = token.actor;
        if (!actor) return;

        const data = REGION_HOOK.getTrigger(this.id);
        if (!data) return;

        const trigger = new Trigger(data, {
            this: { actor, token },
            event: event.name,
        } satisfies TriggerPreOptions<RegionTriggerOptions>);

        await trigger.execute();
    }
}

type RegionTriggerOptions = {
    event: string;
};

export { PF2eTriggerBehaviorType };
export type { RegionTriggerOptions };
