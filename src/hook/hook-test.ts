import { TriggerHook } from "hook/hook";
import { R, userIsActiveGM, warn } from "module-helpers";

class TestHook extends TriggerHook<"test-event"> {
    get events(): ["test-event"] {
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
        if (!userIsActiveGM()) return;

        const token = R.first(canvas.tokens.controlled);
        const actor = token?.actor ?? game.user.character;

        if (!actor) {
            warn("node.event.test-event.warning");
            return;
        }

        this.executeTriggers({ this: { actor, token: token?.document } });
    }
}

export { TestHook };
