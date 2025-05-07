import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";
import { ConditionSlug, EffectSource, GrantItemSource } from "module-helpers";

class AddConditionTriggerNode extends TriggerNode<NodeSchemaOf<"action", "add-condition">> {
    async execute(): Promise<boolean> {
        const slug = (await this.get("condition")) as ConditionSlug;
        const actor = await this.getTargetActor("target");
        const condition = game.pf2e.ConditionManager.conditions.get(slug);

        if (!actor || !condition) {
            return this.send("out");
        }

        const label = await this.get("label");
        const counter = await this.get("counter");
        const duration = await this.get("duration");
        const unided = await this.get("unidentified");
        const isValued = condition.system.value.isValued;

        const origin = duration.origin;
        delete duration.origin;

        if (
            // we do not handle dying or unconcious condition+effect combo
            ["dying", "unconscious"].includes(slug) ||
            (duration.unit === "unlimited" && !unided && !origin)
        ) {
            const source = condition.toObject();

            if (isValued && counter > 1) {
                source.system.value.value = Math.max(counter, 1);
            }

            await actor.createEmbeddedDocuments("Item", [source]);
            return this.send("out");
        }

        const rule: GrantItemSource = {
            key: "GrantItem",
            uuid: condition.uuid,
            onDeleteActions: {
                grantee: "restrict",
            },
        };

        if (isValued && counter > 1) {
            rule.inMemoryOnly = true;

            rule.alterations = [
                {
                    mode: "override",
                    property: "badge-value",
                    value: counter,
                },
            ];
        }

        const system: DeepPartial<EffectSource["system"]> = {
            unidentified: unided,
            duration,
            rules: [rule],
        };

        if (origin) {
            system.context = {
                origin: {
                    actor: origin.actor.uuid,
                    token: origin.token?.uuid ?? null,
                    item: null,
                    spellcasting: null,
                },
                roll: null,
                target: null,
            };
        }

        const prefix = game.i18n.localize("TYPES.Item.effect");
        const effect: PreCreate<EffectSource> = {
            type: "effect",
            name: label || `${prefix}: ${condition.name}`,
            img: condition.img,
            system,
        };

        await actor.createEmbeddedDocuments("Item", [effect]);
        return this.send("out");
    }
}

export { AddConditionTriggerNode };
