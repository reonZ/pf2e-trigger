import { ActorPF2e, EffectSource, ItemSourcePF2e } from "module-helpers";
import { TriggerNode } from "trigger/node/trigger-node";
import { Trigger } from "trigger/trigger";

function getUnilimitedDuration(): TriggerDurationData {
    return {
        expiry: null,
        unit: "unlimited",
        value: -1,
    };
}

async function executeEffect(
    node: TriggerNode,
    actor: ActorPF2e,
    getUnlimitedSource: (() => Promise<ItemSourcePF2e>) | null,
    getEffectData: (() => Promise<GetEffectDataOptions>) | null
) {
    const unided = !!(await (node as DurationNode).get("unidentified"));
    const duration = (await (node as DurationNode).get("duration")) ?? getUnilimitedDuration();
    const context = duration.context;
    delete duration.context;

    if (
        getUnlimitedSource &&
        (!getEffectData || (duration.unit === "unlimited" && !unided && !context))
    ) {
        const source = await getUnlimitedSource();
        await actor.createEmbeddedDocuments("Item", [source]);
    } else if (getEffectData) {
        const { name, img, rule, slug } = await getEffectData();

        const prefix = game.i18n.localize("TYPES.Item.effect");
        const effect: PreCreate<EffectSource> & { system: DeepPartial<EffectSource["system"]> } = {
            type: "effect",
            name: `${prefix}: ${name}`,
            img,
            system: {
                // tokenIcon: { show: false },
                unidentified: unided,
                duration,
                context,
            },
        };

        if (rule) {
            effect.system.rules = [rule];
        }

        if (slug) {
            effect.system.slug = slug;
        }

        await actor.createEmbeddedDocuments("Item", [effect]);
    }
}

function getTriggerSlug(trigger: Trigger | TriggerData, slug: string) {
    return game.pf2e.system.sluggify(`${trigger.id}-${slug}`);
}

function getTriggerOption(trigger: Trigger | TriggerData, slug: string) {
    return `self:effect:${getTriggerSlug(trigger, slug)}`;
}

type DurationNode = TriggerNode<{
    inputs: [{ key: "duration"; type: "duration" }, { key: "unidentified"; type: "boolean" }];
}>;

type GetEffectDataOptions = {
    name: string;
    img: ImageFilePath;
    rule?: object;
    slug?: string;
};

export { executeEffect, getUnilimitedDuration, getTriggerOption, getTriggerSlug };
