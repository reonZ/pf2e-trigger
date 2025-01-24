import { ActorPF2e, CheckDC, ItemPF2e, R, getExtraRollOptions } from "module-helpers";
import { rollSaveSchema } from "schema/action/schema-roll-save";
import { DcNodeEntry, RollNodeEntry } from "schema/schema";
import { TriggerNode } from "../trigger-node";

class RollSaveTriggerNode extends TriggerNode<typeof rollSaveSchema> {
    protected async _execute(target: TargetDocuments) {
        const dcData = await this.get("dc");
        const save = await this.get("save");
        if (!R.isString(save)) return;

        const rollData = await this.get("roll");
        const roller = rollData?.origin?.actor ?? this.options.this.actor;

        const statistic = roller.getStatistic(save);
        if (!statistic) return;

        const roll = await statistic.roll({
            dc: getDc(dcData, rollData),
            origin: dcData?.target?.actor,
            item: rollData?.item as ItemPF2e<ActorPF2e>,
            extraRollOptions: getExtraRollOptions(rollData),
        });
        if (!roll) return;

        await this.send("out", target);
        await this.send("result", target, roll.degreeOfSuccess ?? 2);
    }
}

function getDc(dcData?: DcNodeEntry, rollData?: RollNodeEntry): CheckDC | undefined {
    const { adjustment, against, target, value } = dcData ?? {};
    const item = rollData?.item;

    if (R.isNumber(value)) {
        return { value };
    }

    const ModifierPF2e = game.pf2e.Modifier;
    const defenseStat = target?.actor?.getStatistic(against ?? "")?.clone({
        modifiers: R.isNumber(adjustment)
            ? [new ModifierPF2e({ label: "PF2E.InlineCheck.DCAdjustment", modifier: adjustment })]
            : [],
        rollOptions: [
            item?.isOfType("action", "feat") ? `target:action:slug:${item.slug}` : null,
        ].filter(R.isTruthy),
    });

    if (!defenseStat) return;

    return {
        statistic: defenseStat.dc,
        scope: "check",
        value: defenseStat.dc.value,
        label:
            defenseStat.dc.label ??
            game.i18n.format("PF2E.InlineCheck.DCWithName", { name: defenseStat.label }),
    };
}

export { RollSaveTriggerNode };
