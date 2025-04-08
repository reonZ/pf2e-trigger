import { matchPredicateSchema } from "schema/condition/schema-condition-match-predicate";
import { TriggerNode } from "../trigger-node";

class MatchPredicateTriggerCondition extends TriggerNode<typeof matchPredicateSchema> {
    async execute(): Promise<void> {
        const list = await this.get("list");
        const rawPredicate = await this.get("predicate");
        const parsedPredicate = JSON.parse(rawPredicate);
        const predicate = new game.pf2e.Predicate(parsedPredicate);
        const sendKey = predicate.test(list) ? "true" : "false";

        return this.send(sendKey);
    }
}

export { MatchPredicateTriggerCondition };
