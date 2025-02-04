import { getSubtriggerSchema } from "schema/schema-list";
import { BlueprintNode } from "../blueprint-node";
import { EVENT_COLOR } from "../event/blueprint-event";

class SubtriggerBlueprintNode extends BlueprintNode {
    get icon() {
        return "\uf1e6";
    }

    get headerColor(): number {
        return EVENT_COLOR;
    }

    get title(): string | null {
        return this.subTrigger?.name ?? super.title;
    }

    get subId(): string {
        return this.data.subId!;
    }

    get subTrigger(): TriggerData | undefined {
        return this.blueprint.getTrigger(this.subId);
    }

    get schema(): NodeSchema {
        const sub = this.subTrigger;
        return sub ? getSubtriggerSchema(sub) : super.schema;
    }
}

export { SubtriggerBlueprintNode };
