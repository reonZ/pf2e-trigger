import {
    ActorPF2e,
    MODULE,
    R,
    TokenDocumentPF2e,
    createHook,
    userIsActiveGM,
} from "module-helpers";
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

            if (events?.includes(triggerEventKey)) {
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

            this._activateAll?.();
        } else {
            MODULE.debug("disable", this.constructor.name);

            if (game.user.isGM) {
                this._disable();
            }

            this._disableAll?.();
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
            toggle(enabled?: TEventKey | boolean) {
                const toggle = R.isString(enabled)
                    ? self.activeEvents.has(enabled)
                    : (enabled as boolean);
                hook.toggle(toggle);
            },
        };
    }

    isValidHookActor(actor: Maybe<ActorPF2e>): actor is ActorPF2e {
        return !!actor && !actor.pack;
    }

    createHookOptions(
        actor: Maybe<ActorPF2e>,
        token?: TokenDocumentPF2e | null
    ): PreTriggerExecuteOptionsWithVariables | undefined {
        if (!this.isValidHookActor(actor) || !userIsActiveGM()) return;

        return {
            this: { actor, token },
            variables: {},
        };
    }
}

interface TriggerHook<TEventKey extends NodeEventKey> {
    get conditions(): NodeConditionKey[] | undefined;
    _activateAll(): void;
    _disableAll(): void;
}

export { TriggerHook };
