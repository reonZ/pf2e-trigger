import {
    ActorPF2e,
    AuraData,
    R,
    ScenePF2e,
    TokenAura,
    TokenDocumentPF2e,
    createWrapper,
    deleteInMemory,
    getInMemory,
    runWhenReady,
    setInMemory,
    userIsActiveGM,
} from "module-helpers";
import { createConditionEntry } from ".";
import { runTriggers } from "../trigger";

let _active = false;

const _wrappers = [
    createWrapper("CONFIG.Token.documentClass.prototype.prepareBaseData", tokenPrepareBaseData),
    createWrapper("CONFIG.Token.documentClass.prototype.simulateUpdate", tokenSimulateUpdate),
    createWrapper("CONFIG.Scene.documentClass.prototype.prepareData", scenePF2ePrepareData),
];

function insideAuraCondition(label?: string) {
    return createConditionEntry(
        {
            type: "text",
            key: "aura-slug",
            label,
        },
        ({ actor }, value, { isCombatant }) => {
            return isCombatant(actor) && isInsideAura(actor, value);
        },
        {
            unique: true,
            _enable,
            _disable,
        }
    );
}

function _enable() {
    if (_active) return;

    _active = true;

    for (const wrapper of _wrappers) {
        wrapper.activate();
    }

    runWhenReady(initialAuraCheck);
}

function _disable() {
    if (!_active) return;

    _active = false;

    for (const wrapper of _wrappers) {
        wrapper.disable();
    }

    runWhenReady(auraCheckCleanup);
}

function isInsideAura(actor: ActorPF2e, slug: string) {
    return !!getInMemory<ActorAura[]>(actor, "auras")?.some((aura) => aura.data.slug === slug);
}

function auraSearch(aura: AuraData, origin: AuraOrigin) {
    return ({ data: { slug }, origin: { token } }: ActorAura) =>
        slug === aura.slug && token === origin.token;
}

function getAurasInMemory(actor: ActorPF2e) {
    const current = getInMemory<ActorAura[]>(actor, "auras");
    return current instanceof Array ? current : [];
}

function setAuraInMemory(actor: ActorPF2e, aura: AuraData, origin: AuraOrigin) {
    const auras = getAurasInMemory(actor);

    auras.findSplice(auraSearch(aura, origin));
    auras.push({ data: aura, origin });

    return setInMemory(actor, "auras", auras);
}

function removeAuraFromMemory(actor: ActorPF2e, aura: AuraData, origin: AuraOrigin) {
    const auras = getAurasInMemory(actor);
    auras.findSplice(auraSearch(aura, origin));
    return setInMemory(actor, "auras", auras);
}

function initialAuraCheck() {
    if (!userIsActiveGM()) return;

    const scene = game.scenes.current;
    if (!scene || !canvas.ready || !scene.isInFocus || scene.grid.type !== CONST.GRID_TYPES.SQUARE)
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
            if (actor === auraActor) continue;

            setAuraInMemory(actor, auraData, origin);
        }
    }
}

function auraCheckCleanup() {
    if (!userIsActiveGM()) return;

    const tokens = getSceneTokens();
    const sceneActors = getTokensActors(tokens);

    for (const actor of sceneActors) {
        deleteInMemory(actor, "auras");
    }
}

function scenePF2ePrepareData(this: ScenePF2e, wrapped: libWrapper.RegisterCallback) {
    wrapped();
    checkTokensAuras();
}

function tokenPrepareBaseData(this: TokenDocumentPF2e, wrapped: libWrapper.RegisterCallback) {
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

    const source = { actor: auraActor, token: this.token };
    const affectedActors: Set<ActorPF2e> = new Set();
    const auradTokens = this.scene.tokens.filter(
        (t) => t.actor?.primaryUpdater === game.user && this.containsToken(t)
    );

    for (const token of auradTokens) {
        const actor = token.actor;
        if (!actor || affectedActors.has(actor)) continue;

        affectedActors.add(actor);
        await actor.applyAreaEffects(auraData, source);

        if (auraActor !== actor && userIsActiveGM()) {
            const auras = getAurasInMemory(actor);
            const already = auras.find(auraSearch(auraData, source));

            setAuraInMemory(actor, auraData, source);

            if (!already) {
                runTriggers("aura-enter", { actor, token }, { source });
            }
        }
    }
}

function tokenSimulateUpdate(
    this: TokenDocumentPF2e,
    wrapped: libWrapper.RegisterCallback,
    actorUpdates?: Record<string, unknown>
): void {
    wrapped(actorUpdates);
    checkTokensAuras();
}

function checkTokensAuras() {
    if (!userIsActiveGM()) return;

    const tokens = getSceneTokens();
    const sceneActors = getTokensActors(tokens);
    const tokensAuras = tokens.flatMap((token) => Array.from(token.auras.values()));

    for (const actor of sceneActors) {
        const actorAuras = getAurasInMemory(actor);
        if (!actorAuras.length) continue;

        const actorTokens = actor.getActiveTokens(true, true);

        for (const { data: aura, origin: source } of actorAuras) {
            if (source.actor === actor) continue;

            const tokenAura = tokensAuras.find(
                ({ slug, token }) => slug === aura.slug && token === source.token
            );
            const token = tokenAura
                ? actorTokens.find((token) => tokenAura.containsToken(token))
                : undefined;

            if (!token) {
                removeAuraFromMemory(actor, aura, source);
                runTriggers("aura-leave", { actor, token: actorTokens.at(0) }, { source });
            }
        }
    }
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

function getTokensActors(tokens: TokenDocumentPF2e[]) {
    return R.pipe(
        tokens,
        R.map((token) => token.actor),
        R.filter(R.isTruthy),
        R.unique()
    );
}

type ActorAura = {
    data: AuraData;
    origin: AuraOrigin;
};

type AuraOrigin = Required<TargetDocuments>;

export { insideAuraCondition };
