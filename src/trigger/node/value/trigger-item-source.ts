import { itemSourceSchema } from "@schema/value/item-source-schema";
import { TriggerExecuteOptions } from "@trigger/trigger";
import { ActorPF2e, ItemPF2e, getItemWithSourceId } from "module-helpers";
import { ValueTriggerNode } from "./trigger-node-value";

class ItemSourceTriggerNode extends ValueTriggerNode<typeof itemSourceSchema> {
    protected async _computeValue(
        origin: TargetDocuments,
        options: TriggerExecuteOptions
    ): Promise<ItemPF2e<ActorPF2e> | null> {
        const uuid = await this.get("uuid", origin, options);
        return uuid ? getItemWithSourceId(origin.actor, uuid) : null;
    }
}

export { ItemSourceTriggerNode };
