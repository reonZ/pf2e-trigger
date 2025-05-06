import { GetterTriggerNode } from "./getter";

class SetterTriggerNode extends GetterTriggerNode {
    async execute(): Promise<boolean> {
        const value = await this.get("input");
        this.trigger.setVariable(this.nodeTarget, value);
        return this.send("out");
    }
}

export { SetterTriggerNode };
