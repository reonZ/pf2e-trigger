import { ActorPF2e, AuraData, getInMemory, setInMemory } from "module-helpers";

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

export { auraSearch, getAurasInMemory, setAuraInMemory, removeAuraFromMemory };
