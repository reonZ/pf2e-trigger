import { TriggerData } from "data";
import {
    ActorPF2e,
    createToggleableHook,
    HookOptions,
    MapOfArrays,
    MODULE,
    PersistentHook,
    R,
    userIsGM,
} from "module-helpers";
import { NodeEventKey, NodeKey, NonEventKey } from "schema";
import { Trigger, TriggerPreOptions } from "trigger";

abstract class TriggerHook {
    #triggers = new Map<string, TriggerData>();
    #events = new MapOfArrays<TriggerData>();

    abstract get eventKeys(): NodeEventKey[];

    get nodes(): NonEventKey[] {
        return [];
    }

    get constructorName(): string {
        return this.constructor.name;
    }

    activate() {}
    activateAll() {}
    disable() {}
    disableAll() {}

    initialize(triggers: TriggerData[]) {
        this.#triggers.clear();
        this.#events.clear();

        const isGM = userIsGM();
        const nodeKeys: NodeKey[] = this.nodes;
        const eventKeys = this.eventKeys;

        let active = false;

        trigger: for (const trigger of triggers) {
            const eventKey = trigger.event.key;

            if (!trigger.isSubtrigger && eventKeys.includes(eventKey)) {
                this.#triggers.set(trigger.id, trigger);
                this.#events.add(eventKey, trigger);

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

        if (active) {
            MODULE.debug(this.constructorName, "-> ENABLED", this);
            if (isGM) {
                this.activate();
            }
            this.activateAll();
        } else {
            MODULE.debug(this.constructorName, "-> DISABLED", this);
            if (isGM) {
                this.disable();
            }
            this.disableAll();
        }
    }

    getTrigger(id: string): TriggerData | undefined {
        return this.#triggers.get(id);
    }

    async executeTriggers<TOptions extends Record<string, any> | never = never>(
        options: TriggerPreOptions<TOptions>,
        event?: this["eventKeys"][number]
    ) {
        const triggers = event ? this.#events.get(event) : this.#triggers.values();

        for (const data of triggers ?? []) {
            const trigger = new Trigger(data, options);
            await trigger.execute();
        }
    }

    isValidActor(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return !!actor && !actor.pack;
    }

    isValidEventActor(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return this.isValidActor(actor) && game.user.isActiveGM;
    }

    createEventHook(
        event: string,
        listener: (...args: any[]) => any,
        options: HookOptions = {}
    ): PersistentEventHook<this["eventKeys"][number]> {
        const hook = createToggleableHook(event, listener, options);
        const self = this;

        type TriggerHookEvent = this["eventKeys"][number];

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
                const [booleans, events] = R.partition(args, R.isBoolean) as [
                    boolean[],
                    TriggerHookEvent[]
                ];

                hook.toggle(
                    booleans.every(R.isTruthy) &&
                        (!events.length || events.some((event) => self.#events.has(event)))
                );
            },
        };
    }
}

type PersistentEventHook<TEvents extends NodeEventKey> = Omit<PersistentHook, "toggle"> & {
    toggle(...args: (TEvents | boolean)[]): void;
};

export { TriggerHook };
export type { PersistentEventHook };
