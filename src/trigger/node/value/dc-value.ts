import { extractModifierAdjustments, Statistic } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerDcEntry, TriggerNode } from "trigger";

class DcValueTriggerNode extends TriggerNode<NodeSchemaOf<"value", "dc-value">> {
    async query(): Promise<TriggerDcEntry> {
        const origin = await this.get("origin");
        const value = await this.get("value");
        const StatisticCls = origin?.actor.saves?.will?.constructor as typeof Statistic;

        if (!origin || !StatisticCls) {
            return { value, scope: "check" };
        }

        const actor = origin.actor;
        const item = await this.get("item");
        const domains = ["saving-throw", "all"];

        const modifiers = [
            new game.pf2e.Modifier({
                slug: "base",
                label: "PF2E.ModifierTitle",
                modifier: value - 10,
                adjustments: extractModifierAdjustments(
                    actor.synthetics.modifierAdjustments,
                    domains,
                    "base"
                ),
            }),
        ];

        const rollOptions = item?.isOfType("action", "feat")
            ? [`target:action:slug:${item.slug}`]
            : undefined;

        const statistic = new StatisticCls(actor, {
            slug: "fake",
            label: game.i18n.localize("PF2E.SavingThrow"),
            domains,
            modifiers,
            rollOptions,
            check: {
                type: "saving-throw",
            },
        });

        const label = item
            ? game.i18n.format("PF2E.InlineCheck.DCWithName", { name: item.name })
            : undefined;

        return {
            label,
            scope: "check",
            statistic: statistic.dc,
            target: origin,
            value: statistic.dc.value,
        };
    }
}

export { DcValueTriggerNode };
