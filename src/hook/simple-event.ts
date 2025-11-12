import { PersistentEventHook, TriggerHook } from "hook";
import { R } from "module-helpers";
import { NodeEventKey } from "schema";

abstract class SimpleEventHook extends TriggerHook {
    #eventHook: PersistentEventHook<NodeEventKey>;
    #eventKey: NodeEventKey;

    constructor(eventName: string, eventKey: NodeEventKey) {
        super();

        this.#eventHook ??= this.createEventHook(eventName, this._onEvent.bind(this));
        this.#eventKey = eventKey;
    }

    get constructorName(): string {
        return R.pipe(this.#eventKey.split("-"), R.map(R.capitalize()), R.join("")) + "Hook";
    }

    get eventKeys(): NodeEventKey[] {
        return [this.#eventKey];
    }

    activate(): void {
        this.#eventHook.activate();
    }

    disable(): void {
        this.#eventHook.disable();
    }

    abstract _onEvent(...args: any[]): void;
}

export { SimpleEventHook };
