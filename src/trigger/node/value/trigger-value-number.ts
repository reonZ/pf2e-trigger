import { TriggerNode } from "../trigger-node";

class NumberTriggerValue extends TriggerNode<PrimitiveValueSchema<"number">> {
    #cached: number | undefined;

    async query(key: "value"): Promise<number> {
        return (this.#cached ??= (await this.get("input")) ?? 0);
    }
}

export { NumberTriggerValue };
