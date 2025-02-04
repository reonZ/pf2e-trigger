import { TriggerNode } from "../trigger-node";

class TextTriggerValue extends TriggerNode<PrimitiveValueSchema<"text">> {
    #cached: string | undefined;

    async query(key: "value"): Promise<string> {
        return (this.#cached ??= (await this.get("input")) ?? "");
    }
}

export { TextTriggerValue };
