import { ActorPF2e, R } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SceneTokensTriggerNode extends TriggerNode<NodeSchemaOf<"action", "scene-tokens">> {
    async execute(): Promise<boolean> {
        const scene = this.target.token?.scene ?? game.scenes.current;

        if (!scene) {
            return this.send("out");
        }

        const hazard = await this.get("hazard");
        const loot = await this.get("loot");
        const party = await this.get("party");

        const callback = (actor: ActorPF2e | null): actor is ActorPF2e => {
            return (
                !!actor &&
                (hazard || !actor.isOfType("hazard")) &&
                (loot || !actor.isOfType("loot")) &&
                (party || !actor.isOfType("party"))
            );
        };

        const targets = R.pipe(
            scene.tokens.contents,
            R.map((token): TargetDocuments | undefined => {
                const actor = token.actor;
                return callback(actor) ? { actor, token } : undefined;
            }),
            R.filter(R.isTruthy)
        );

        this.setVariable("other", targets);

        return this.send("out");
    }
}

export { SceneTokensTriggerNode };
