import { EXTRACT_TYPES } from "helpers/helpers-extract";

declare global {
    type DocumentExtractType = (typeof EXTRACT_TYPES)[number];
}
