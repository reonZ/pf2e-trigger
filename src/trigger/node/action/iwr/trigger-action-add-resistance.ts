import { WeaknessType } from "module-helpers";
import { AddIwrTriggerNode } from "./triggger-action-add-iwr";

class AddResistanceTriggerNode extends AddIwrTriggerNode<WeaknessType> {
    get iwrKey(): "Resistance" {
        return "Resistance";
    }

    get iwrImg(): ImageFilePath {
        return "icons/svg/fire-shield.svg";
    }
}

export { AddResistanceTriggerNode };
