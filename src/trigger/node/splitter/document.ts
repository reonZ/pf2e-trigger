import { NodeEntryType } from "data";
import { ActorPF2e, ItemPF2e, R, TokenDocumentPF2e } from "module-helpers";
import { TriggerNode } from "trigger";

abstract class DocumentSplitterTriggerNode<T> extends TriggerNode {
    abstract getDocument(): Promise<Maybe<T>>;

    async execute(): Promise<boolean> {
        const document = await this.getDocument();

        await Promise.all(
            this.customOutputs.map(async ({ key, type }) => {
                const value = foundry.utils.getProperty(document ?? {}, key);
                const interpreted = this.#interpretValue(type, value);
                const converted = await this.getConvertedValue({ type }, interpreted);

                if (R.isNonNullish(converted)) {
                    this.setVariable(key, converted);
                }
            })
        );

        return this.send("out");
    }

    #interpretValue(type: NodeEntryType, value: any) {
        if (type === "target") {
            return this.#interpretTargetValue(value);
        }

        if (type === "list") {
            const list = value instanceof Set ? [...value] : R.isArray(value) ? value : [];
            return list.filter(R.isString);
        }

        return this.isValidCustomEntry(type, value) ? value : undefined;
    }

    #interpretTargetValue(value: any): Maybe<TargetDocuments> {
        if (value instanceof Actor) {
            return {
                actor: value as ActorPF2e,
                token: value.token,
            };
        }

        const token = value instanceof Token ? value.document : value;

        if (token instanceof TokenDocument && token.actor) {
            return {
                actor: token.actor as ActorPF2e,
                token: token as TokenDocumentPF2e,
            };
        }
    }
}

class ActorSplitterTriggerNode extends DocumentSplitterTriggerNode<ActorPF2e> {
    async getDocument(): Promise<Maybe<ActorPF2e>> {
        return ((await this.get("input")) as TargetDocuments)?.actor;
    }
}

class ItemSplitterTriggerNode extends DocumentSplitterTriggerNode<ItemPF2e> {
    async getDocument(): Promise<Maybe<ItemPF2e>> {
        return await this.get("input");
    }
}

class ObjectSplitterTriggerNode extends DocumentSplitterTriggerNode<Record<string, any>> {
    async getDocument(): Promise<Maybe<Record<string, any>>> {
        return await this.get("input");
    }
}

export { ActorSplitterTriggerNode, ItemSplitterTriggerNode, ObjectSplitterTriggerNode };
