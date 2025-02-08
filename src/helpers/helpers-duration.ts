import { ActorPF2e, EffectSource, ItemSourcePF2e } from "module-helpers";
import { TriggerNode } from "trigger/node/trigger-node";

function getUnilimitedDuration(): TriggerDurationData {
    return {
        expiry: null,
        unit: "unlimited",
        value: -1,
    };
}

async function executeWithDuration(
    node: DurationNode,
    actor: ActorPF2e,
    getUnlimitedSource: (() => Promise<ItemSourcePF2e>) | null,
    getEffectData: () => Promise<{ name: string; img: ImageFilePath; rule: object }>
) {
    const unided = !!(await node.get("unidentified"));
    const duration = (await node.get("duration")) ?? getUnilimitedDuration();
    const context = duration.context;
    delete duration.context;

    if (getUnlimitedSource && duration.unit === "unlimited" && !unided && !context) {
        const source = await getUnlimitedSource();
        await actor.createEmbeddedDocuments("Item", [source]);
    } else {
        const { name, img, rule } = await getEffectData();

        const prefix = game.i18n.localize("TYPES.Item.effect");
        const effect: PreCreate<EffectSource> = {
            type: "effect",
            name: `${prefix}: ${name}`,
            img,
            system: {
                tokenIcon: { show: false },
                unidentified: unided,
                duration,
                rules: [rule],
                context,
            },
        };

        await actor.createEmbeddedDocuments("Item", [effect]);
    }
}

type DurationNode = TriggerNode<{
    inputs: [{ key: "duration"; type: "duration" }, { key: "unidentified"; type: "boolean" }];
}>;

export { executeWithDuration, getUnilimitedDuration };
export type { DurationNode };
