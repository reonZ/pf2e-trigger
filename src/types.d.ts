export {};

declare global {
    type ExtractNodeMap<T> = {
        [t in NodeType]: NodeSchemas[t] extends Record<infer K extends string, NodeRawSchema>
            ? { [k in K]: T }
            : never;
    };
    // type ExtractNodeMap<T> = {
    //     [t in Exclude<
    //         NodeType,
    //         "subtrigger" | "macro"
    //     >]: NodeSchemas[t] extends Record<infer K extends string, NodeRawSchema>
    //         ? { [k in K]: T }
    //         : never;
    // };
}
