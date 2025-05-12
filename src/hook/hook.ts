import { TriggerData } from "data";
import { ActorPF2e, createHook, MODULE, PersistentHook, R, userIsGM } from "module-helpers";
import { NodeEventKey, NodeKey, NonEventKey } from "schema";
import { Trigger, TriggerPreOptions } from "trigger";

abstract class TriggerHook {
    #triggers = new Map<string, TriggerData>();
    #events: PartialRecord<NodeEventKey, TriggerData[]> = {};

    abstract get events(): NodeEventKey[];
    abstract activate(): void;
    abstract disable(): void;

    get nodes(): NonEventKey[] {
        return [];
    }

    activateAll() {}
    disableAll() {}

    initialize(triggers: TriggerData[], subtriggers: TriggerData[]) {
        this.#triggers.clear();
        this.#events = {};

        const isGM = userIsGM();
        const nodeKeys: NodeKey[] = this.nodes;
        const eventKeys = this.events;

        let active = false;

        trigger: for (const trigger of triggers) {
            const eventKey = trigger.event.key;

            if (eventKeys.includes(eventKey)) {
                this.#triggers.set(trigger.id, trigger);
                (this.#events[eventKey] ??= []).push(trigger);

                active = true;
                continue trigger;
            }

            if (!active && nodeKeys.length) {
                for (const node of trigger.nodes) {
                    if (nodeKeys.includes(node.key)) {
                        active = true;
                        continue trigger;
                    }
                }
            }
        }

        if (!active && nodeKeys.length) {
            subtrigger: for (const trigger of subtriggers) {
                for (const node of trigger.nodes) {
                    if (nodeKeys.includes(node.key)) {
                        active = true;
                        continue subtrigger;
                    }
                }
            }
        }

        if (active) {
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

    async executeTriggers<TOptions extends Record<string, any> | never = never>(
        options: TriggerPreOptions<TOptions>,
        event?: this["events"][number]
    ) {
        const triggers = event ? this.#events[event] : this.#triggers.values();

        for (const data of triggers ?? []) {
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

    createEventHook(
        event: string,
        listener: (...args: any[]) => any
    ): PersistentEventHook<this["events"][number]> {
        const hook = createHook(event, listener);
        const self = this;

        type TriggerHookEvent = this["events"][number];

        return {
            get enabled(): boolean {
                return hook.enabled;
            },
            activate() {
                hook.activate();
            },
            disable() {
                hook.disable();
            },
            toggle(...args: (TriggerHookEvent | boolean)[]) {
                const activeEvents = R.keys(self.#events);
                const [booleans, events] = R.partition(args, R.isBoolean) as [
                    boolean[],
                    TriggerHookEvent[]
                ];

                hook.toggle(
                    booleans.every(R.isTruthy) &&
                        (!events.length || events.some((event) => activeEvents.includes(event)))
                );
            },
        };
    }
}

type PersistentEventHook<TEvents extends NodeEventKey> = Omit<PersistentHook, "toggle"> & {
    toggle(...args: (TEvents | boolean)[]): void;
};

export { TriggerHook };
