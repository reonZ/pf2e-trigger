import {
    ActorPF2e,
    ChoiceSetSource,
    getItemFromUuid,
    getItemSource,
    getItemSourceId,
    ItemPF2e,
    ItemType,
    R,
} from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

const CHOICE_SET_MODES = ["flag", "rollOption"] as const;

class CreateItemTriggerNode extends TriggerNode<NodeSchemaOf<"action", "create-item">> {
    async execute(): Promise<boolean> {
        const uuid = await this.get("uuid");
        const actor = await this.getTargetActor("target");
        const item = await getItemFromUuid(uuid);

        if (!item || !actor) {
            return this.send("out");
        }

        const duplicates = !!(await this.get("duplicate"));
        const maxTakable = !duplicates ? 1 : item.isOfType("feat") ? item.maxTakable : Infinity;

        if (maxTakable !== Infinity) {
            const uuid = getItemSourceId(item);
            const exist: ItemPF2e<ActorPF2e>[] = [];
            const items = actor.itemTypes[item.type as ItemType];

            for (const found of items) {
                if (found.sourceId !== uuid) continue;
                exist.push(found);
            }

            if (exist.length >= maxTakable) {
                return this.send("out");
            }
        }

        const source = getItemSource(item);
        const choiceSets = (await this.getCustomInputs(true)) as string[];

        for (const path of choiceSets) {
            const [mode, name, choice] = path.split(":");
            const index = Number(choice);
            if (!R.isNumber(index) || !R.isIncludedIn(mode, CHOICE_SET_MODES)) continue;

            const choiceSet = source.system.rules.find(
                (rule: ChoiceSetSource): rule is ChoiceSetSource => {
                    if (rule.key !== "ChoiceSet") return false;
                    return mode === "flag" ? rule.flag === name : rule.rollOption === name;
                }
            );

            if (R.isArray(choiceSet?.choices)) {
                const choice = choiceSet.choices.at(index) as object | undefined;
                const value = choice && "value" in choice && choice.value;

                if (R.isNonNullish(value)) {
                    choiceSet.selection = value;
                }
            }
        }

        const [created] = await actor.createEmbeddedDocuments("Item", [source]);

        this.setVariable("item", created);

        return this.send("out");
    }
}

export { CreateItemTriggerNode };
