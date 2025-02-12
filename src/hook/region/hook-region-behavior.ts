import { RegionEventPF2e, localize, userIsActiveGM } from "module-helpers";
import fields = foundry.data.fields;
import { executeRegionHook } from "hook/hook-list";

class PF2eTriggerBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
    override events = new Set<"tokenEnter" | "tokenExit">(["tokenEnter", "tokenExit"]);

    static defineSchema() {
        return {
            id: new fields.StringField({
                initial: "",
                nullable: false,
                label: localize("region.id"),
                required: true,
            }),
        };
    }

    protected override async _handleRegionEvent(event: RegionEventPF2e): Promise<void> {
        if (
            !userIsActiveGM() ||
            !["tokenEnter", "tokenExit"].includes(event.name) ||
            !("token" in event.data)
        )
            return;

        const actor = event.data.token.actor;
        if (!actor) return;

        executeRegionHook(this.id, {
            token: event.data.token,
            actor,
        });
    }
}

interface PF2eTriggerBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
    get id(): string;
}

export { PF2eTriggerBehaviorType };
