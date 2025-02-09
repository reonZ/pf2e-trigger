import { WeaknessType, imagePath } from "module-helpers";
import { AddIwrTriggerNode } from "./triggger-action-add-iwr";

class AddWeaknessTriggerNode extends AddIwrTriggerNode<WeaknessType> {
    get iwrKey(): "Weakness" {
        return "Weakness";
    }

    get iwrImg(): ImageFilePath {
        return imagePath("broken-heart", "svg");
    }
}

export { AddWeaknessTriggerNode };
