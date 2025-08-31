import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class RollFlatTriggerNode extends TriggerNode<NodeSchemaOf<"action", "roll-flat">> {
    async execute(): Promise<boolean> {
        const value = await this.get("dc");
        const label = game.i18n.localize("PF2E.FlatCheck");
        const rolled = await game.pf2e.Check.roll(new game.pf2e.StatisticModifier(label), {
            actor: await this.getTargetActor("target"),
            type: "flat-check",
            dc: { value, visible: true },
            options: new Set(["flat-check"]),
            skipDialog: true,
        });

        this.setVariable("result", rolled?.degreeOfSuccess ?? 0);
        return this.send("out");
    }
}

export { RollFlatTriggerNode };
