import { ImmunityType, imagePath } from "module-helpers";
import { AddIwrTriggerNode } from "./triggger-action-add-iwr";

class AddImmunityTriggerNode extends AddIwrTriggerNode<ImmunityType> {
    get iwrKey(): "Immunity" {
        return "Immunity";
    }

    get iwrImg(): ImageFilePath {
        return imagePath("ankh", "svg");
    }
}

export { AddImmunityTriggerNode };
