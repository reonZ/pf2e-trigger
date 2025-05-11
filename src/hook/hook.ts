import { TriggerData } from "data";
import { ActorPF2e, createHook, MODULE, R, userIsGM } from "module-helpers";
import { NodeEventKey, NodeKey, NonEventKey } from "schema";
import { Trigger, TriggerPreOptions } from "trigger";

abstract class TriggerHook {
    #triggers = new Collection<TriggerData>();
    #active = new Set<this["events"][number]>();

    abstract get events(): NodeEventKey[];
    abstract activate(): void;
    abstract disable(): void;

    get nodes(): NonEventKey[] {
        return [];
    }

    get activeEvents(): Set<this["events"][number]> {
        return this.#active;
    }

    activateAll() {}
    disableAll() {}

    initialize(triggers: TriggerData[], subtriggers: TriggerData[]) {
        this.#triggers.clear();
        this.#active.clear();

        const isGM = userIsGM();
        const nodeKeys: NodeKey[] = this.nodes;
        const eventKeys = this.events;

        trigger: for (const trigger of triggers) {
            const triggerEventKey = trigger.event.key;

            if (eventKeys.includes(triggerEventKey)) {
                this.#triggers.set(trigger.id, trigger);
                this.#active.add(triggerEventKey);
                continue trigger;
            }

            if (nodeKeys.length) {
                for (const node of trigger.nodes) {
                    if (nodeKeys.includes(node.key)) {
                        this.#active.add(triggerEventKey);
                        continue trigger;
                    }
                }
            }
        }

        if (!this.#active.size && nodeKeys.length) {
            subtrigger: for (const trigger of subtriggers) {
                for (const node of trigger.nodes) {
                    if (nodeKeys.includes(node.key)) {
                        this.#active.add(trigger.event.key);
                        continue subtrigger;
                    }
                }
            }
        }

        if (this.#active.size) {
            MODULE.debug(this.constructor.name, "active");
            if (isGM) {
                this.activate();
            }
            this.activateAll();
        } else {
            MODULE.debug(this.constructor.name, "disabled");
            if (isGM) {
                this.disable();
            }
            this.disableAll();
        }
    }

    async executeTriggers(options: TriggerPreOptions, event?: this["events"][number]) {
        for (const data of this.#triggers) {
            if (event && data.event.key !== event) continue;

            const trigger = new Trigger(data, options);
            await trigger.execute();
        }
    }

    isValidActor(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return !!actor && !actor.pack;
    }

    isValidEvent(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return this.isValidActor(actor) && game.user.isActiveGM;
    }

    createEventHook(event: string, listener: (...args: any[]) => any) {
        const hook = createHook(event, listener);
        const activeEvents = this.activeEvents;

        type TriggerHookEvent = this["events"][number];

        return {
            activate() {
                hook.activate();
            },
            disable() {
                hook.disable();
            },
            toggle(...args: (TriggerHookEvent | boolean)[]) {
                const [booleans, events] = R.partition(args, R.isBoolean) as [
                    boolean[],
                    TriggerHookEvent[]
                ];

                hook.toggle(
                    booleans.every(R.isTruthy) &&
                        (!events.length || events.some((event) => activeEvents.has(event)))
                );
            },
        };
    }
}

export { TriggerHook };
