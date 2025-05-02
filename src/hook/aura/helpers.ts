import {
    ActorPF2e,
    AuraData,
    deleteInMemory,
    getInMemory,
    R,
    ScenePF2e,
    setInMemory,
    TokenDocumentPF2e,
} from "module-helpers";

/**
 * repurposed version of
 * https://github.com/foundryvtt/pf2e/blob/d179b37b0389a1d6b238f3dd2ad125a04b958184/src/module/scene/token-document/aura/index.ts#L87
 */
function initialAuraCheck() {
    if (!game.user.isActiveGM) return;

    const scene = game.scenes.current;
    if (!scene || !canvas.ready || !scene.isInFocus || scene.grid.type !== CONST.GRID_TYPES.SQUARE)
        return;

    const tokens = getSceneTokens();
    const auras = tokens.flatMap((token) => Array.from(token.auras.values()));

    for (const aura of auras) {
        const auraActor = aura.token.actor;
        const auraData = auraActor?.auras.get(aura.slug);

        if (!auraActor || !auraData) return;

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
    if (!game.user.isActiveGM) return;

    const tokens = getSceneTokens();
    const sceneActors = getTokensActors(tokens);

    for (const actor of sceneActors) {
        deleteInMemory(actor, "auras");
    }
}

function getSceneTokens(): TokenDocumentPF2e[] {
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

function getTokensActors(tokens: TokenDocumentPF2e[]): ActorPF2e[] {
    return R.pipe(
        tokens,
        R.map((token) => token.actor),
        R.filter(R.isTruthy),
        R.unique()
    );
}

function auraSearch(aura: AuraData, origin: AuraOrigin): (actorAura: ActorAura) => boolean {
    return ({ data: { slug }, origin: { token } }: ActorAura) => {
        return slug === aura.slug && token === origin.token;
    };
}

function getAurasInMemory(actor: ActorPF2e): ActorAura[] {
    const current = getInMemory<ActorAura[]>(actor, "auras");
    return current instanceof Array ? current : [];
}

function setAuraInMemory(actor: ActorPF2e, aura: AuraData, origin: AuraOrigin): boolean {
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

type AuraOrigin = Required<TargetDocuments>;

type ActorAura = {
    data: AuraData;
    origin: AuraOrigin;
};

export {
    auraCheckCleanup,
    auraSearch,
    getAurasInMemory,
    getSceneTokens,
    getTokensActors,
    initialAuraCheck,
    removeAuraFromMemory,
    setAuraInMemory,
};
