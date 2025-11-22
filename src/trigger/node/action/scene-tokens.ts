import { ActorPF2e, R, ScenePF2e, TokenDocumentPF2e } from "module-helpers";
import { NodeSchemaOf } from "schema";
import { TriggerNode } from "trigger";

class SceneTokensTriggerNode extends TriggerNode<NodeSchemaOf<"action", "scene-tokens">> {
    async execute(): Promise<boolean> {
        const scene = this.target.token?.scene ?? game.scenes.current;

        if (!scene) {
            return this.send("out");
        }

        const targets = R.pipe(
            scene.tokens.contents,
            R.filter((token): token is TokenDocumentPF2e<ScenePF2e> & { actor: ActorPF2e } => {
                return !!token.actor;
            }),
            R.map((token): TargetDocuments => {
                return {
                    actor: token.actor,
                    token,
                };
            })
        );

        this.setVariable("other", targets);

        return this.send("out");
    }
}

export { SceneTokensTriggerNode };
