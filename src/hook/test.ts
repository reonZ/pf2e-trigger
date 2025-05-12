import { TriggerHook } from "hook";
import { R, warning } from "module-helpers";

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

        if (!this.isValidActor(actor)) {
            warning("node.event.test-event.warning");
            return;
        }

        this.executeTriggers({
            // @ts-ignore
            this: { actor, token: token?.document },
        });
    }
}

export { TestHook };
