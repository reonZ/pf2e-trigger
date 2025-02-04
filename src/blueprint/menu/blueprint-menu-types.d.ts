import { ApplicationConfiguration } from "module-helpers";

declare global {
    type BlueprintMenuOptions = ApplicationConfiguration & {
        style: Partial<CSSStyleDeclaration>;
    };

    type BlueprintMenuResolve<T> = (value: T | null | PromiseLike<T | null>) => void;

    type BlueprintMenuVariableKey =
        `${string}.outputs.${string}.${NonNullable<NodeEntryType>}.${string}`;
}
