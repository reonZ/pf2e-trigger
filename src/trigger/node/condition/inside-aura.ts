import { NodeSchemaOf } from "schema";
import { TriggerNode } from "../node";

class InsideAuraTriggerNode extends TriggerNode<InsideAuraSchema> {
    async execute(): Promise<boolean> {
        // TODO return false if not inside aura

        // for (let i = 0; i < 5; i++) {
        //     // console.log("iteration", i);
        //     // this.setVariable("source", i);
        //     await this.send("true");
        // }
        const slug = await this.get("slug");
        if (!slug) {
            return this.send("false");
        }

        return true;
    }
}

type InsideAuraSchema = NodeSchemaOf<"condition", "inside-aura">;

export { InsideAuraTriggerNode };
