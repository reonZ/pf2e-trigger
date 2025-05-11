import {
    auraCheckCleanup,
    auraSearch,
    getAurasInMemory,
    getSceneTokens,
    getTokensActors,
    initialAuraCheck,
    removeAuraFromMemory,
    setAuraInMemory,
    TriggerHook,
} from "hook";
import {
    activateWrappers,
    ActorPF2e,
    createToggleableWrapper,
    disableWrappers,
    executeWhenReady,
    ScenePF2e,
    TokenAura,
    TokenDocumentPF2e,
} from "module-helpers";
import { NonEventKey } from "schema";

class AuraHook extends TriggerHook {
    #wrappers = [
        createToggleableWrapper(
            "WRAPPER",
            "CONFIG.Token.documentClass.prototype.prepareBaseData",
            this.#tokenPrepareBaseData,
            { context: this }
        ),
        createToggleableWrapper(
            "WRAPPER",
            "CONFIG.Token.documentClass.prototype.simulateUpdate",
            this.#tokenSimulateUpdate,
            { context: this }
        ),
        createToggleableWrapper(
            "WRAPPER",
            "CONFIG.Scene.documentClass.prototype.prepareData",
            this.#scenePF2ePrepareData,
            { context: this }
        ),
    ];

    get events(): ["aura-enter", "aura-leave"] {
        return ["aura-enter", "aura-leave"];
    }

    get nodes(): NonEventKey[] {
        return ["inside-aura"];
    }

    activate(): void {
        activateWrappers(this.#wrappers);
        executeWhenReady(initialAuraCheck);
    }

    disable(): void {
        disableWrappers(this.#wrappers);
        executeWhenReady(auraCheckCleanup);
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
        if (!game.user.isActiveGM) return;

        const tokens = getSceneTokens();
        const sceneActors = getTokensActors(tokens);
        const tokensAuras = tokens.flatMap((token) => Array.from(token.auras.values()));

        for (const actor of sceneActors) {
            const actorAuras = getAurasInMemory(actor);
            if (!actorAuras.length) continue;

            const actorTokens = actor.getActiveTokens(true, true);

            for (const aura of actorAuras) {
                if (aura.origin.actor === actor) continue;

                const tokenAura = tokensAuras.find(
                    ({ slug, token }) => slug === aura.data.slug && token === aura.origin.token
                );
                const token = tokenAura
                    ? actorTokens.find((token) => tokenAura.containsToken(token))
                    : undefined;

                if (!token) {
                    removeAuraFromMemory(actor, aura.data, aura.origin);

                    if (this.isValidActor(actor) && actor.inCombat) {
                        const target = { actor, token: actorTokens.at(0) };
                        this.executeTriggers({ this: target, aura }, "aura-leave");
                    }
                }
            }
        }
    }

    /**
     * rewrite of
     * https://github.com/foundryvtt/pf2e/blob/d179b37b0389a1d6b238f3dd2ad125a04b958184/src/module/scene/token-document/aura/index.ts#L87
     */
    async #notifyActors(aura: TokenAura): Promise<void> {
        if (!aura.scene.isInFocus) return;

        const auraActor = aura.token.actor;
        const auraData = auraActor?.auras.get(aura.slug);
        if (!auraActor || !auraData) return;

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

            if (auraActor !== actor && game.user.isActiveGM) {
                const auras = getAurasInMemory(actor);
                const already = auras.find(auraSearch(auraData, source));

                setAuraInMemory(actor, auraData, source);

                if (!already && this.isValidActor(actor) && actor.inCombat) {
                    const target = { actor, token };
                    this.executeTriggers(
                        {
                            this: target,
                            aura: { data: auraData, origin: source },
                        },
                        "aura-enter"
                    );
                }
            }
        }
    }
}

export { AuraHook };
