import { createHook, Hook } from "foundry-pf2e";
import { runTrigger, Trigger, TriggerInputEntry, TriggerRunOptions, Triggers } from "../trigger";
import { AuraTestOptions, AuraTrigger, AuraTriggerEvent } from "./aura";
import { TriggerEvent } from "./base";

abstract class TurnTriggerEvent extends TriggerEvent {
    #hook: Hook | null = null;
    #hasAuraTrigger: boolean = false;

    abstract get id(): "turn-start" | "turn-end";

    get conditions() {
        return [
            {
                name: "starts",
                type: "select",
                required: true,
                options: [
                    {
                        value: "hasItem",
                        subInputs: [{ name: "itemUuid", type: "uuid", required: true }],
                    },
                    {
                        value: "hasAura",
                        subInputs: AuraTriggerEvent.prototype.conditions,
                    },
                ],
            },
        ] as const satisfies Readonly<TriggerInputEntry[]>;
    }

    _enable(enabled: boolean, triggers: TurnTrigger[]): void {
        const hadAuraTrigger = this.#hasAuraTrigger;
        const hasAuraTrigger = (this.#hasAuraTrigger = triggers.some(
            (trigger) => trigger.conditions.starts === "hasAura"
        ));

        if (!hadAuraTrigger && hasAuraTrigger) {
            AuraTriggerEvent.auraLinkedEvents.add();
        } else if (hadAuraTrigger && !hasAuraTrigger) {
            AuraTriggerEvent.auraLinkedEvents.remove();
        }

        super._enable(enabled, triggers);

        this.#hook ??= createHook(
            this.id === "turn-start" ? "pf2e.startTurn" : "pf2e.endTurn",
            this.#onHook.bind(this)
        );

        this.#hook.toggle(enabled);
    }

    label(trigger: TurnTrigger): string {
        const eventLabel = super.label(trigger);

        if (this.#isAuraTrigger(trigger)) {
            return AuraTriggerEvent.prototype.label(trigger, eventLabel);
        }

        // TODO we need to create label for has-item
        return eventLabel;
    }

    test(actor: ActorPF2e, trigger: TurnTrigger, options: TurnTestOptions): Promisable<boolean> {
        if (this.#isAuraTrigger(trigger)) {
            return AuraTriggerEvent.prototype.test(actor, trigger, options);
        }

        // TODO we need to do the test for has-item
        return true;
    }

    getOrigin(): TargetDocuments | undefined {
        return undefined;
    }

    #isAuraTrigger(trigger: Trigger): trigger is AuraTrigger {
        return this.#isAuraConditions(trigger.conditions);
    }

    #isAuraConditions(conditions: Trigger["conditions"]): conditions is AuraTrigger["conditions"] {
        return conditions.starts === "hasAura" && "auraSlug" in conditions;
    }

    #onHook(combatant: CombatantPF2e, encounter: EncounterPF2e, userId: string) {
        const actor = combatant.actor;
        if (!actor) return;

        runTrigger(this.id, actor, {} satisfies TriggerRunOptions);
    }
}

class TurnStartTriggerEvent extends TurnTriggerEvent {
    get id(): "turn-start" {
        return "turn-start";
    }

    get icon(): string {
        return "fa-solid fa-hourglass-start";
    }
}

class TurnEndTriggerEvent extends TurnTriggerEvent {
    get id(): "turn-end" {
        return "turn-end";
    }

    get icon(): string {
        return "fa-solid fa-hourglass-end";
    }
}

type TurnTrigger = Triggers["turn-start"] | Triggers["turn-end"];

type TurnTestOptions = AuraTestOptions;

export { TurnEndTriggerEvent, TurnStartTriggerEvent };
export type { TurnTestOptions };
