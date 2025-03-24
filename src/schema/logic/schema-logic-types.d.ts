export {};

declare global {
    type LogicSchema<T extends NodeEntryType> = {
        in: true;
        outs: BooleanSchemaOuts;
        inputs: [{ key: "a"; type: T }, { key: "b"; type: T }];
    };
}
