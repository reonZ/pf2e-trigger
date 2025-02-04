import { R } from "module-helpers";

const booleanSchemaOuts = [{ key: "true" }, { key: "false" }] as const;

function processCustomSchema(data: MaybePartial<NodeDataCustom>): NodeData["custom"] {
    // TODO we want to do some validating eventually, but this is a lot of work
    return {
        inputs: processCustomsInputs(data?.inputs),
        outputs: processCustomsOutputs(data?.outputs),
    };
}

function processCustomsInputs(data: MaybePartial<NodeSchemaInputs>): NodeSchemaInputs {
    return R.isArray(data) ? (data as NodeSchemaInputs) : [];
}

function processCustomsOutputs(data: MaybePartial<NodeSchemaOutputs>): NodeSchemaOutputs {
    return R.isArray(data) ? (data as NodeSchemaOutputs) : [];
}

export { booleanSchemaOuts, processCustomSchema };
