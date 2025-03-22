import { R } from "module-helpers";
import { rollDataSchema } from "schema/value/schema-value-roll-data";
import { TriggerNode } from "../trigger-node";

class RollDataTriggerValue extends TriggerNode<typeof rollDataSchema> {
    #options: string[] | undefined;
    #traits: string[] | undefined;

    async query(key: string): Promise<RollNodeEntry> {
        this.#options ??= R.pipe(
            await this.get("options"),
            R.split(","),
            R.map((x) => x.trim()),
            R.filter(R.isTruthy)
        );

        this.#traits ??= R.pipe(
            await this.get("traits"),
            R.split(","),
            R.map((x) => x.trim()),
            R.filter(R.isTruthy)
        );

        return {
            options: this.#options,
            traits: this.#traits,
            item: await this.get("item"),
            origin: await this.get("origin"),
        };
    }
}

export { RollDataTriggerValue };
