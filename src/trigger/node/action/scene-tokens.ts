import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SceneTokensTriggerNode extends TriggerNode<NodeSchemaOf<"action", "scene-tokens">> {
    async execute(): Promise<boolean> {
        const scene = this.target.token?.scene ?? game.scenes.current;

        if (!scene) {
            return this.send("out");
        }

        for (const token of scene.tokens) {
            const actor = token.actor;
            if (!actor || token === this.target.token) continue;

            this.setVariable("other", { actor, token });

            if (!(await this.send("out"))) {
                return false;
            }
        }

        return true;
    }
}

export { SceneTokensTriggerNode };
