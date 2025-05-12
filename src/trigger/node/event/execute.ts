import { TriggerNode } from "trigger";

class ExecuteTriggerNode extends TriggerNode {
    async execute(): Promise<boolean> {
        const values = this.getOption("values");
        this.setOutputValues(values);
        return this.send("out");
    }
}

export { ExecuteTriggerNode };
