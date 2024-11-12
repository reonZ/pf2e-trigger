import {
    beautifySlug,
    createWrapper,
    deleteInMemory,
    getInMemory,
    hasItemWithSourceId,
    R,
    runWhenReady,
    setInMemory,
    userIsActiveGM,
} from "foundry-pf2e";
import { runTrigger, TriggerInputEntry, Triggers } from "../trigger";
import { TriggerEvent } from "./base";

let _allEnabled = 0;

const _wrappers = [
    createWrapper(
        "CONFIG.Token.documentClass.prototype.prepareBaseData",
        tokenDocumentPF2ePrepareBaseData
    ),
    createWrapper(
        "CONFIG.Token.documentClass.prototype.simulateUpdate",
        tokenDocumentPF2eSimulateUpdate
    ),
    createWrapper("CONFIG.Scene.documentClass.prototype.prepareData", scenePF2ePrepareData),
];

abstract class AuraTriggerEvent extends TriggerEvent {
    get conditions() {
        return [
            { name: "auraSlug", type: "text", required: true },
            { name: "targetItem", type: "uuid" },
            { name: "originItem", type: "uuid" },
            { name: "targets", type: "select", options: ["all", "allies", "enemies"] },
            { name: "includeSelf", type: "toggle" },
        ] as const satisfies Readonly<TriggerInputEntry[]>;
    }

    get allEnabled() {
        return _allEnabled > 0;
    }

    _enable(enabled: boolean): void {
        const previousAllEnabled = this.allEnabled;

        if (enabled && !this.enabled) {
            _allEnabled += 1;
        } else if (!enabled && this.enabled) {
            _allEnabled -= 1;
        }

        const currentAllEnabled = this.allEnabled;

        super._enable(enabled);

        for (const wrapper of _wrappers) {
            wrapper.toggle(currentAllEnabled);
        }

        runWhenReady(() => {
            if (currentAllEnabled && !previousAllEnabled) {
                this.#initialAuraCheck();
            } else if (!currentAllEnabled && previousAllEnabled) {
                this.#auraCheckCleanup();
            }
        });
    }

    createLabel(trigger: AuraTrigger): string {
        const input = trigger.conditions.auraSlug.trim() ?? "";
        const eventLabel = super.createLabel(trigger);

        return input ? `${eventLabel} - ${beautifySlug(input)}` : eventLabel;
    }

    test(
        actor: ActorPF2e,
        { originItem, includeSelf, auraSlug, targetItem, targets }: AuraTrigger["conditions"],
        { aura, origin }: { aura: AuraData; origin: Required<TargetDocuments> }
    ): Promisable<boolean> {
        return (
            auraSlug === aura.slug &&
            this.testCondition(includeSelf, (c) => c === (actor === origin.actor)) &&
            this.actorsRespectAlliance(origin.actor, actor, targets) &&
            this.testCondition(targetItem, (c) => hasItemWithSourceId(actor, c)) &&
            this.testCondition(originItem, (c) => hasItemWithSourceId(origin.actor, c))
        );
    }

    getAuras(actor: ActorPF2e) {
        return getAurasInMemory(actor);
    }

    #initialAuraCheck() {
        if (!userIsActiveGM()) return;

        const scene = game.scenes.current;

        if (
            !scene ||
            !canvas.ready ||
            !scene.isInFocus ||
            scene.grid.type !== CONST.GRID_TYPES.SQUARE
        )
            return;

        const tokens = getSceneTokens();
        const auras = tokens.flatMap((token) => Array.from(token.auras.values()));

        for (const aura of auras) {
            const auraActor = aura.token.actor;
            const auraData = auraActor?.auras.get(aura.slug);
            if (!(auraActor && auraData?.effects.length)) return;

            const auradTokens = scene.tokens.filter((token) => aura.containsToken(token));
            const affectedActors = getTokensActors(auradTokens);

            const origin = { actor: auraActor, token: aura.token };
            for (const actor of affectedActors) {
                setAuraInMemory(actor, auraData, origin);
            }
        }
    }

    #auraCheckCleanup() {
        if (!userIsActiveGM()) return;

        const tokens = getSceneTokens();
        const sceneActors = getTokensActors(tokens);

        for (const actor of sceneActors) {
            deleteInMemory(actor, "auras");
        }
    }
}

class AuraEnterTriggerEvent extends AuraTriggerEvent {
    get id(): "aura-enter" {
        return "aura-enter";
    }

    get icon(): string {
        return "fa-solid fa-circle";
    }
}

class AuraLeaveTriggerEvent extends AuraTriggerEvent {
    get id(): "aura-leave" {
        return "aura-leave";
    }

    get icon(): string {
        return "fa-regular fa-circle";
    }
}

function tokenDocumentPF2ePrepareBaseData(
    this: TokenDocumentPF2e,
    wrapped: libWrapper.RegisterCallback
) {
    wrapped();

    for (const aura of this.auras.values()) {
        Object.defineProperty(aura, "notifyActors", {
            value: notifyActors,
        });
    }
}

async function notifyActors(this: TokenAura): Promise<void> {
    if (!this.scene.isInFocus) return;

    const auraActor = this.token.actor;
    const auraData = auraActor?.auras.get(this.slug);
    if (!(auraActor && auraData?.effects.length)) return;

    const origin = { actor: auraActor, token: this.token };
    const affectedActors: Set<ActorPF2e> = new Set();
    const auradTokens = this.scene.tokens.filter(
        (t) => t.actor?.primaryUpdater === game.user && this.containsToken(t)
    );

    for (const token of auradTokens) {
        const actor = token.actor;
        if (!actor || affectedActors.has(actor)) continue;

        affectedActors.add(actor);

        await actor.applyAreaEffects(auraData, origin);

        if (userIsActiveGM()) {
            const auras = getAurasInMemory(actor);
            const already = auras.find(auraSearch(auraData, origin));

            setAuraInMemory(actor, auraData, origin);

            if (!already) {
                runTrigger("aura-enter", actor, {
                    aura: auraData,
                    origin,
                    target: { actor, token },
                });
            }
        }
    }
}

function tokenDocumentPF2eSimulateUpdate(
    this: TokenDocumentPF2e,
    wrapped: libWrapper.RegisterCallback,
    actorUpdates?: Record<string, unknown>
): void {
    wrapped(actorUpdates);

    if (userIsActiveGM()) {
        checkTokensAuras();
    }
}

function scenePF2ePrepareData(this: ScenePF2e, wrapped: libWrapper.RegisterCallback) {
    wrapped();

    if (userIsActiveGM()) {
        checkTokensAuras();
    }
}

function checkTokensAuras() {
    const tokens = getSceneTokens();
    const sceneActors = getTokensActors(tokens);
    const tokensAuras = tokens.flatMap((token) => Array.from(token.auras.values()));

    for (const actor of sceneActors) {
        const actorAuras = getAurasInMemory(actor);
        if (!actorAuras.length) continue;

        const actorTokens = actor.getActiveTokens(true, true);

        for (const { aura, origin } of actorAuras) {
            const tokenAura = tokensAuras.find(
                ({ slug, token }) => slug === aura.slug && token === origin.token
            );

            if (!tokenAura || !actorTokens.some((token) => tokenAura.containsToken(token))) {
                removeAuraFromMemory(actor, aura, origin);
                runTrigger("aura-leave", actor, { aura, origin, target: { actor } });
            }
        }
    }
}

function getTokensActors(tokens: TokenDocumentPF2e[]) {
    return R.pipe(
        tokens,
        R.map((token) => token.actor),
        R.filter(R.isTruthy),
        R.unique()
    );
}

function getSceneTokens() {
    const scene = game.scenes.current;
    if (!canvas.ready || !scene) return [];

    return scene.tokens.reduce((list: TokenDocumentPF2e<ScenePF2e>[], token) => {
        if (token.isLinked && list.some((t) => t.actor === token.actor)) {
            return list;
        }
        list.push(token);
        return list;
    }, []);
}

function getAurasInMemory(actor: ActorPF2e) {
    const current = getInMemory<ActorAura[]>(actor, "auras");

    return current instanceof Array ? current : [];
}

function setAuraInMemory(actor: ActorPF2e, aura: AuraData, origin: AuraOrigin) {
    const auras = getAurasInMemory(actor);

    auras.findSplice(auraSearch(aura, origin));
    auras.push({ aura, origin, selfApplied: actor === origin.actor });

    return setInMemory(actor, "auras", auras);
}

function removeAuraFromMemory(actor: ActorPF2e, aura: AuraData, origin: AuraOrigin) {
    const auras = getAurasInMemory(actor);

    auras.findSplice(auraSearch(aura, origin));

    return setInMemory(actor, "auras", auras);
}

function auraSearch(aura: AuraData, origin: AuraOrigin) {
    return ({ aura: { slug }, origin: { token } }: ActorAura) =>
        slug === aura.slug && token === origin.token;
}

type AuraOrigin = Required<TargetDocuments>;

type ActorAura = {
    aura: AuraData;
    origin: AuraOrigin;
    selfApplied: boolean;
};

type AuraTrigger = Triggers["aura-enter"] | Triggers["aura-leave"];

export { AuraEnterTriggerEvent, AuraLeaveTriggerEvent };
