import { actorSplitterSchema } from "schema/splitter/schema-splitter-actor";
import { TriggerNode } from "../trigger-node";

class ActorTriggerSplitter extends TriggerNode<typeof actorSplitterSchema> {
    async execute(): Promise<void> {
        const { actor } = (await this.get("target")) ?? this.target;

        this.setVariable("name", actor.name);
        this.setVariable("level", actor.level);

        this.send("out");
    }
}

export { ActorTriggerSplitter };
