import { R, warning } from "module-helpers";
import { TriggerHook } from "./hook";

class TestHook extends TriggerHook {
    get events(): ["test-event"] {
        return ["test-event"];
    }

    activate(): void {
        foundry.utils.setProperty(game, "trigger.test", this.#runTest.bind(this));
    }

    disable(): void {
        foundry.utils.setProperty(game, "trigger.test", () => {});
    }

    #runTest() {
        if (!game.user.isActiveGM) return;

        const token = R.first(canvas.tokens.controlled);
        const actor = token?.actor ?? game.user.character;

        if (!actor) {
            warning("node.event.test-event.warning");
            return;
        }

        this.executeTriggers({ this: { actor, token: token?.document } });
    }
}

export { TestHook };
