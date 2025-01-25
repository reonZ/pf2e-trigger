import { R, warn } from "module-helpers";
import { NodeEventKey } from "schema/schema-list";
import { TriggerHook } from "./trigger-hook";

class TestHook extends TriggerHook {
    get events(): NodeEventKey[] {
        return ["test-event"];
    }

    protected _activate(): void {
        game.trigger ??= {};
        game.trigger.test = this.#runTest.bind(this);
    }

    protected _disable(): void {
        game.trigger ??= {};
        game.trigger.test = () => {};
    }

    #runTest() {
        const token = R.first(canvas.tokens.controlled);
        const actor = token?.actor ?? game.user.character;

        if (!actor) {
            warn("node.event.test-event.warning");
            return;
        }

        this._executeTriggers({ this: { actor, token: token?.document } });
    }
}

export { TestHook };
