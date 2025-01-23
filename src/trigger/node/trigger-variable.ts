import { schemaVariable } from "schema/schema-variable";
import { TriggerNode } from "./trigger-node";

class VariableTriggerNode extends TriggerNode<typeof schemaVariable> {}

export { VariableTriggerNode };
