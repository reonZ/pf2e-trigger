import { R } from "module-helpers";

const booleanSchemaOuts = [{ key: "true" }, { key: "false" }] as const;

function processCustomSchema(data: Maybe<Partial<NodeDataCustom>>): NodeData["custom"] {
    // TODO we want to do some validating eventually, but this is a lot of work
    return {
        inputs: processCustomsInputs(data?.inputs),
        outputs: processCustomsOutputs(data?.outputs),
    };
}

function processCustomsInputs(data: Maybe<Partial<NodeSchemaInput[]>>): NodeSchemaInput[] {
    return R.isArray(data) ? (data as NodeSchemaInput[]) : [];
}

function processCustomsOutputs(data: Maybe<Partial<NodeSchemaOutputs>>): NodeSchemaOutputs {
    return R.isArray(data) ? (data as NodeSchemaOutputs) : [];
}

export { booleanSchemaOuts, processCustomSchema };
