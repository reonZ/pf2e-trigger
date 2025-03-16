import { ActorPF2e, MODULE, R, createHook, userIsActiveGM } from "module-helpers";
import { Trigger } from "trigger/trigger";

abstract class TriggerHook<TEventKey extends NodeEventKey> {
    #active: Set<TEventKey> = new Set();
    #triggers: TriggerData[] = [];

    abstract get events(): TEventKey[];
    protected abstract _activate(): void;
    protected abstract _disable(): void;

    get activeEvents(): Set<TEventKey> {
        return this.#active;
    }

    get triggers() {
        return this.#triggers;
    }

    getTrigger(id: string): TriggerData | undefined {
        return this.#triggers.find((trigger) => trigger.id === id);
    }

    initialize(triggers: TriggerData[]) {
        this.#triggers.length = 0;
        this.#active.clear();

        const events = this.events;
        const conditions = this.conditions;

        triggerLoop: for (const trigger of triggers) {
            const triggerEventKey = trigger.event.key as TEventKey;

            if (events.includes(triggerEventKey)) {
                this.#triggers.push(trigger);
                this.#active.add(triggerEventKey);
                continue;
            }

            if (!conditions) continue;

            for (const node of R.values(trigger.nodes)) {
                if (
                    node.type === "condition" &&
                    conditions.includes(node.key as NodeConditionKey)
                ) {
                    this.#active.add(triggerEventKey);
                    continue triggerLoop;
                }
            }
        }

        if (this.#active.size) {
            MODULE.debug("activate", this.constructor.name);

            if (game.user.isGM) {
                this._activate();
            }

            this._activateAll();
        } else {
            MODULE.debug("disable", this.constructor.name);

            if (game.user.isGM) {
                this._disable();
            }

            this._disableAll();
        }
    }

    async executeTriggers(options: PreTriggerExecuteOptions) {
        for (const data of this.#triggers) {
            await this.executeTrigger(data, options);
        }
    }

    async executeEventTriggers(event: TEventKey, options: PreTriggerExecuteOptions) {
        for (const data of this.#triggers) {
            if (data.event.key !== event) continue;
            await this.executeTrigger(data, options);
        }
    }

    async executeTrigger(data: TriggerData, options: PreTriggerExecuteOptions) {
        const trigger = new Trigger(data);
        const auras = await trigger.insideAura?.getActorAuras(options.this.actor);

        if (auras?.length) {
            for (const aura of auras) {
                await trigger.execute({
                    ...options,
                    aura,
                });
            }
        } else {
            await trigger.execute(options);
        }
    }

    createEventHook(event: string, listener: (...args: any[]) => any) {
        const hook = createHook(event, listener);
        const self = this;

        return {
            activate() {
                hook.activate();
            },
            disable() {
                hook.disable();
            },
            toggle(...args: (TEventKey | boolean)[]) {
                const [booleans, events] = R.partition(args, R.isBoolean) as [
                    boolean[],
                    TEventKey[]
                ];

                hook.toggle(
                    (!booleans.length || booleans.every(R.isTruthy)) &&
                        (!events.length || events.some((event) => self.activeEvents.has(event)))
                );
            },
        };
    }

    isValidHookActor(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return !!actor && !actor.pack;
    }

    isValidHookEvent(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return this.isValidHookActor(actor) && userIsActiveGM();
    }

    protected _activateAll(): void {}

    protected _disableAll(): void {}
}

interface TriggerHook<TEventKey extends NodeEventKey> {
    get conditions(): NodeConditionKey[] | undefined;
}

export { TriggerHook };
