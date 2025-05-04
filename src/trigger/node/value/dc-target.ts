import { ModifierPF2e } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerDcEntry, TriggerNode } from "trigger";

class DcTargetTriggerNode extends TriggerNode<NodeSchemaOf<"value", "dc-target">> {
    async query(): Promise<TriggerDcEntry> {
        const target = await this.get("target");
        const against = await this.get("against");
        const statistic = target?.actor.getStatistic(against);

        if (!target || !statistic) {
            return { value: 0, scope: "check" };
        }

        const adjustment = await this.get("adjustment");
        const item = await this.get("item");
        const modifiers: ModifierPF2e[] = [];

        if (adjustment !== 0) {
            modifiers.push(
                new game.pf2e.Modifier({
                    label: "PF2E.InlineCheck.DCAdjustment",
                    modifier: adjustment,
                })
            );
        }

        const rollOptions = item?.isOfType("action", "feat")
            ? [`target:action:slug:${item.slug}`]
            : undefined;

        const defenseStat = statistic.clone({ modifiers, rollOptions });
        const label =
            defenseStat.dc.label ??
            game.i18n.format("PF2E.InlineCheck.DCWithName", { name: defenseStat.label });

        return {
            target,
            statistic: defenseStat.dc,
            scope: "check",
            value: defenseStat.dc.value,
            label,
        };
    }
}

export { DcTargetTriggerNode };
