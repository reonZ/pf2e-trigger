import { SplitLogicSchema } from "./schema-logic";

const successSplitSchema = {
    inputs: [{ key: "input", type: "number" }],
    outputs: [
        {
            key: "3",
            label: "PF2E.Check.Result.Degree.Check.criticalSuccess",
        },
        {
            key: "2",
            label: "PF2E.Check.Result.Degree.Check.success",
        },
        {
            key: "1",
            label: "PF2E.Check.Result.Degree.Check.failure",
        },
        {
            key: "0",
            label: "PF2E.Check.Result.Degree.Check.criticalFailure",
        },
    ],
} as const satisfies SplitLogicSchema<"number">;

export { successSplitSchema };
