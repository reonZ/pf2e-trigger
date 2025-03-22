import { R } from "module-helpers";
import { dcTargetSchema } from "schema/value/schema-value-dc-target";
import { TriggerNode } from "../trigger-node";

class TargetDcTriggerValue extends TriggerNode<typeof dcTargetSchema> {
    #against: string | undefined;
    #adjustment: number | undefined;

    async query(key: "dc"): Promise<NodeDCEntry> {
        const target = await this.getTarget("target");

        if (!target) {
            return { value: 0 };
        }

        const ModifierPF2e = game.pf2e.Modifier;
        const against = (this.#against ??= (await this.get("against")).trim());
        const adjustment = (this.#adjustment ??= await this.get("adjustment"));
        const item = await this.get("item");

        const defenseStat = target.actor.getStatistic(against)?.clone({
            modifiers: R.isNumber(adjustment)
                ? [
                      new ModifierPF2e({
                          label: "PF2E.InlineCheck.DCAdjustment",
                          modifier: adjustment,
                      }),
                  ]
                : [],
            rollOptions: [
                item?.isOfType("action", "feat") ? `target:action:slug:${item.slug}` : null,
            ].filter(R.isTruthy),
        });

        if (!defenseStat) {
            return { value: 0 };
        }

        return {
            target,
            statistic: defenseStat.dc,
            scope: "check",
            value: defenseStat.dc.value,
            label:
                defenseStat.dc.label ??
                game.i18n.format("PF2E.InlineCheck.DCWithName", { name: defenseStat.label }),
        };
    }
}

export { TargetDcTriggerValue };
