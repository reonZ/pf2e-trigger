import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class FilterTargetsTriggerNode extends TriggerNode<NodeSchemaOf<"action", "filter-targets">> {
    async execute(): Promise<boolean> {
        const code = await this.get("callback");
        const targets = await this.get("multi");

        if (!targets?.length) {
            return this.send("out");
        }

        const values = await this.getCustomInputs(true);

        try {
            const Fn = function () {}.constructor as SyncFunction;
            const callback = new Fn("target", "inputs", "values", code);
            const result = targets.filter((target) => callback(target, values, values));

            this.setVariable("result", result);
        } catch {}

        return this.send("out");
    }
}

type SyncFunction = {
    new <T>(...args: any[]): (...args: any[]) => T;
};

export { FilterTargetsTriggerNode };
