import { BlueprintNode } from "./blueprint-node";

function makeModuleNode<TBase extends AbstractConstructorOf<BlueprintNode>>(
    BaseClass: TBase
): TBase {
    abstract class ModuleBlueprintNode extends BaseClass {
        get subtitle(): string {
            return `${super.subtitle} (${this.schema.module})`;
        }
    }

    return ModuleBlueprintNode;
}

export { makeModuleNode };
