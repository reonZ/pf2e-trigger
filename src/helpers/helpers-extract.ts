import { NODE_ENTRY_VALUE_TYPE } from "data/data-entry";
import { R } from "module-helpers";

const EXTRACT_TYPES = ["boolean", "number", "text", "list"] as const;

function extractValueFromDocument(
    document: ClientDocument,
    type: DocumentExtractType,
    path: string
) {
    const cursor = fu.getProperty(document, path);

    if (type === "list") {
        return R.pipe(
            cursor instanceof Set ? [...cursor] : R.isArray(cursor) ? cursor : [],
            R.filter(R.isString)
        );
    } else if (cursor.constructor === NODE_ENTRY_VALUE_TYPE[type]) {
        return cursor;
    }
}

export { EXTRACT_TYPES, extractValueFromDocument };
