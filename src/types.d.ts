export {};

declare global {
    type ExtractNodeMap<T> = {
        [t in NodeType]: NodeSchemas[t] extends Record<infer K extends string, NodeRawSchema>
            ? { [k in K]: T }
            : never;
    };

    interface ConfigPF2e {
        Pf2eTrigger: {
            conditionTypes: Record<string, string>;
        };
    }
}
