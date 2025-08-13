import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class MatchPredicateTriggerNode extends TriggerNode<NodeSchemaOf<"condition", "match-predicate">> {
    async execute(): Promise<boolean> {
        const list = await this.get("list");
        const predicateStr = await this.get("predicate");
        const parsedPredicate = JSON.parse(predicateStr);
        const predicate = new game.pf2e.Predicate(parsedPredicate);
        const sendKey = predicate.test(list);

        return this.send(sendKey);
    }
}

export { MatchPredicateTriggerNode };
