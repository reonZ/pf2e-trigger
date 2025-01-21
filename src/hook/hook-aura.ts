import { NodeConditionKey, NodeEventKey } from "schema/schema-list";
import {
    ActorPF2e,
    R,
    ScenePF2e,
    TokenAura,
    TokenDocumentPF2e,
    createWrapper,
    deleteInMemory,
    isCurrentCombatant,
    runWhenReady,
    userIsActiveGM,
} from "module-helpers";
import {
    auraSearch,
    getAurasInMemory,
    removeAuraFromMemory,
    setAuraInMemory,
} from "../helpers/helpers-aura";
import { TriggerHook } from "./trigger-hook";

class AuraHook extends TriggerHook {
    #wrappers = [
        createWrapper(
            "CONFIG.Token.documentClass.prototype.prepareBaseData",
            this.#tokenPrepareBaseData,
            { context: this }
        ),
        createWrapper(
            "CONFIG.Token.documentClass.prototype.simulateUpdate",
            this.#tokenSimulateUpdate,
            { context: this }
        ),
        createWrapper(
            "CONFIG.Scene.documentClass.prototype.prepareData",
            this.#scenePF2ePrepareData,
            { context: this }
        ),
    ];

    get events(): NodeEventKey[] {
        return ["aura-enter", "aura-leave"];
    }

    get conditions(): NodeConditionKey[] {
        return ["inside-aura"];
    }

    protected _activate(): void {
        for (const wrapper of this.#wrappers) {
            wrapper.activate();
        }

        runWhenReady(initialAuraCheck);
    }

    protected _disable(): void {
        for (const wrapper of this.#wrappers) {
            wrapper.disable();
        }

        runWhenReady(auraCheckCleanup);
    }

    #tokenPrepareBaseData(token: TokenDocumentPF2e, wrapped: libWrapper.RegisterCallback) {
        wrapped();

        for (const aura of token.auras.values()) {
            Object.defineProperty(aura, "notifyActors", {
                value: () => this.#notifyActors(aura),
            });
        }
    }

    #tokenSimulateUpdate(
        token: TokenDocumentPF2e,
        wrapped: libWrapper.RegisterCallback,
        actorUpdates?: Record<string, unknown>
    ): void {
        wrapped(actorUpdates);
        this.#checkTokensAuras();
    }

    #scenePF2ePrepareData(scene: ScenePF2e, wrapped: libWrapper.RegisterCallback) {
        wrapped();
        this.#checkTokensAuras();
    }

    #checkTokensAuras() {
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

                    if (isCurrentCombatant(actor)) {
                        const target = { actor, token: actorTokens.at(0) };
                        this._executeTriggers("aura-leave", { target, source, aura });
                    }
                }
            }
        }
    }

    async #notifyActors(aura: TokenAura): Promise<void> {
        if (!aura.scene.isInFocus) return;

        const auraActor = aura.token.actor;
        const auraData = auraActor?.auras.get(aura.slug);
        if (!(auraActor && auraData?.effects.length)) return;

        const source = { actor: auraActor, token: aura.token };
        const affectedActors: Set<ActorPF2e> = new Set();
        const auradTokens = aura.scene.tokens.filter(
            (t) => t.actor?.primaryUpdater === game.user && aura.containsToken(t)
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

                if (!already && isCurrentCombatant(actor)) {
                    const target = { actor, token };
                    this._executeTriggers("aura-enter", { target, source, aura: auraData });
                }
            }
        }
    }
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

export { AuraHook };
