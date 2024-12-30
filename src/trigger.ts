import {
    ActorPF2e,
    ItemPF2e,
    ItemType,
    MODULE,
    R,
    getItemWithSourceId,
    getSetting,
    itemTypeFromUuid,
} from "module-helpers";
import { TriggerAction, getActionEntry, initializeActions, processActions } from "./actions";
import {
    TriggerCondition,
    createNewCondition,
    getConditionEntries,
    getConditionEntry,
    initializeConditions,
    processConditions,
} from "./conditions";
import { getEventEntries, getEventEntry, initializeEvents } from "./events";

const TRIGGERS: Collection<Trigger[]> = new Collection();
const ITEM_TYPES: Record<string, ItemType | undefined> = {};

function initializeTriggers() {
    initializeConditions();
    initializeActions();
    initializeEvents();
}

function getTriggers(clone?: boolean) {
    const flag = getSetting<DeepPartial<Trigger>[]>("triggers");
    return clone ? foundry.utils.deepClone(flag) : flag;
}

function getItemType(uuid: string) {
    return uuid in ITEM_TYPES ? ITEM_TYPES[uuid] : (ITEM_TYPES[uuid] = itemTypeFromUuid(uuid));
}

function createNewTrigger(type: string): Trigger | undefined {
    const eventEntry = getEventEntry(type);
    if (!eventEntry) return;

    const requiredConditions = R.pipe(
        eventEntry.conditions,
        R.map(({ key }) => createNewCondition(key, false)),
        R.filter(R.isTruthy),
        R.mapToObj((condition) => [condition.key, condition])
    );

    return {
        id: foundry.utils.randomID(),
        event: type,
        requiredConditions,
        optionalConditions: [],
        actions: [],
    };
}

function processTrigger(trigger: DeepPartial<Trigger>): trigger is Trigger {
    if (!R.isString(trigger.id) || !R.isString(trigger.event)) return false;

    const eventEntry = getEventEntry(trigger.event);
    if (!eventEntry) return false;

    if (!processConditions(trigger, eventEntry)) return false;
    if (!processActions(trigger, eventEntry)) return false;

    return true;
}

function prepareTriggers() {
    TRIGGERS.clear();

    MODULE.debugGroup("prepare triggers");

    const rawTriggers = getTriggers(true);
    const triggers: Trigger[] = [];

    for (const trigger of rawTriggers) {
        if (!processTrigger(trigger)) continue;

        const eventEntries = TRIGGERS.get(trigger.event) ?? [];
        eventEntries.push(trigger);
        TRIGGERS.set(trigger.event, eventEntries);

        triggers.push(trigger);
    }

    const processedEvents: Set<string> = new Set();
    for (const eventEntry of getEventEntries()) {
        const key = eventEntry.key;
        const group = eventEntry.group ?? key;

        if (!eventEntry._enable || !eventEntry._disable || processedEvents.has(group)) continue;

        processedEvents.add(group);

        if (TRIGGERS.has(key)) {
            MODULE.debug(`event '${key}' enabled`);
            eventEntry._enable();
        } else {
            MODULE.debug(`event '${key}' disabled`);
            eventEntry._disable();
        }
    }

    const processedConditions: Set<string> = new Set();
    for (const conditionEntry of getConditionEntries()) {
        const key = conditionEntry.key;

        if (!conditionEntry._enable || !conditionEntry._disable || processedConditions.has(key))
            continue;

        processedConditions.add(key);

        const hasCondition = triggers.some((trigger) =>
            [...R.values(trigger.requiredConditions), ...trigger.optionalConditions].some(
                (condition) => condition.key === key
            )
        );

        if (hasCondition) {
            MODULE.debug(`condition '${key}' enabled`);
            conditionEntry._enable();
        } else {
            MODULE.debug(`condition '${key}' disabled`);
            conditionEntry._disable();
        }
    }

    MODULE.debugGroupEnd();
}

async function runTriggers(key: string, target: TargetDocuments, options: TriggerRunOptions = {}) {
    const eventEntry = getEventEntry(key);
    if (!eventEntry) return;

    const triggers = TRIGGERS.get(key);
    if (!triggers?.length) return;

    MODULE.debugGroup(`run '${key}' triggers`);

    const hasItemCached: Record<string, Record<string, ItemPF2e<ActorPF2e> | null>> = {};
    const isCombatantCached: Record<string, boolean> = {};

    const cached: TriggerCache = {
        hasItem: (actor, uuid) => {
            const type = getItemType(uuid);
            const actorHasItem = (hasItemCached[actor.uuid] ??= {});

            return uuid in actorHasItem
                ? actorHasItem[uuid]
                : (actorHasItem[uuid] = getItemWithSourceId(actor, uuid, type));
        },
        isCombatant: (actor) => {
            return (isCombatantCached[actor.uuid] ??= (() => {
                const combat = game.combat;
                return !!combat && combat.combatant === actor.combatant;
            })());
        },
    };

    triggerLoop: for (const trigger of triggers) {
        MODULE.debug(`run trigger '${trigger.id}'`);

        const conditions = [...R.values(trigger.requiredConditions), ...trigger.optionalConditions];

        for (const condition of conditions) {
            const conditionEntry = getConditionEntry(condition.key);
            if (!conditionEntry) continue;

            const usedTarget =
                (conditionEntry.allowSource && condition.isSource && options.source) || target;

            if (!(await conditionEntry.test(usedTarget, condition.value, cached))) {
                MODULE.debug(`condition '${condition.key}' failed`);
                continue triggerLoop;
            }

            MODULE.debug(`condition '${condition.key}' passed`);
        }

        for (let i = 0; i < trigger.actions.length; i++) {
            const action = trigger.actions[i];
            const actionEntry = getActionEntry(action.key);
            if (!actionEntry) continue;

            const execute = () => {
                return actionEntry.execute(target, action.options, cached, options);
            };

            let nextAction = trigger.actions.at(i + 1);
            if (nextAction?.linked) {
                if (!(await execute())) {
                    MODULE.debug(`action '${action.key}' executed and break chain`);
                    MODULE.debug(`action '${nextAction.key}' skipped`);

                    i++;
                    while ((nextAction = trigger.actions.at(i + 1))?.linked) {
                        MODULE.debug(`action '${nextAction.key}' skipped`);
                        i++;
                    }

                    continue;
                }
            } else {
                execute();
            }

            if (action.endProcess) {
                MODULE.debug(`action '${action.key}' executed and end process`);
                continue triggerLoop;
            } else {
                MODULE.debug(`action '${action.key}' executed`);
            }
        }
    }

    MODULE.debugGroupEnd();
}

type TriggerRunOptions = {
    source?: TargetDocuments;
};

type Trigger = {
    id: string;
    event: string;
    requiredConditions: Record<string, TriggerCondition>;
    optionalConditions: TriggerCondition[];
    actions: TriggerAction[];
};

type TriggerCache = {
    hasItem: (actor: ActorPF2e, uuid: string) => ItemPF2e<ActorPF2e> | null;
    isCombatant: (actor: ActorPF2e) => boolean;
};

export { createNewTrigger, getTriggers, initializeTriggers, prepareTriggers, runTriggers };
export type { Trigger, TriggerCache, TriggerRunOptions };
