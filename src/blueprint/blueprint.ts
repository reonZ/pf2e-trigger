import {
    BlueprintApplication,
    BlueprintConnectionsLayer,
    BlueprintEntry,
    BlueprintGridLayer,
    BlueprintMenu,
    BlueprintMenuGroup,
    BlueprintNode,
    BlueprintNodesLayer,
} from "blueprint";
import {
    createEntryId,
    getCompatibleTypes,
    NODE_NONBRIDGE_TYPES,
    NodeEntryId,
    NodeType,
    NonBridgeEntryType,
    TriggerData,
    TriggerDataVariable,
    TriggerNodeDataSource,
    WorldTriggers,
} from "data";
import {
    confirmDialog,
    dataToDatasetString,
    distanceToPoint,
    getSetting,
    ItemPF2e,
    localize,
    MacroPF2e,
    MODULE,
    R,
    setSetting,
    subtractPoint,
    waitDialog,
} from "module-helpers";
import {
    FilterGroupEntry,
    getFilterGroups,
    isSubtriggerOutput,
    NodeEventKey,
    NodeKey,
} from "schema";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #initialized = false;
    #parent: BlueprintApplication | undefined;
    #trigger: string | null = null;
    #worldTriggers: WorldTriggers;
    #hitArea = new PIXI.Rectangle();
    #gridLayer: BlueprintGridLayer;
    #connectionsLayer: BlueprintConnectionsLayer;
    #nodesLayer: BlueprintNodesLayer;
    #drag: { origin: Point; dragging?: boolean } | null = null;

    constructor() {
        super({
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        this.#worldTriggers = this.#getWorldTriggers();

        this.stage.addChild(
            (this.#gridLayer = new BlueprintGridLayer()),
            (this.#connectionsLayer = new BlueprintConnectionsLayer(this)),
            (this.#nodesLayer = new BlueprintNodesLayer(this))
        );

        this.stage.hitArea = this.#hitArea;
        this.stage.eventMode = "static";

        this.view.addEventListener("drop", this.#onDropCanvasData.bind(this));

        MODULE.debug("Blueprint\n", this);
    }

    get parent(): BlueprintApplication | undefined {
        return this.#parent;
    }

    get parentElement(): HTMLElement | undefined {
        return this.parent?.element;
    }

    get trigger(): TriggerData | undefined {
        return this.getTrigger(this.#trigger);
    }

    get triggers(): foundry.abstract.EmbeddedCollection<TriggerData> {
        return this.#worldTriggers.triggers;
    }

    get nodesLayer(): BlueprintNodesLayer {
        return this.#nodesLayer;
    }

    get connectionsLayer(): BlueprintConnectionsLayer {
        return this.#connectionsLayer;
    }

    initialize(parent: BlueprintApplication) {
        if (this.#initialized) return;

        this.#initialized = true;
        this.#parent = parent;

        this.#gridLayer.initialize(this);

        this.parentElement?.prepend(this.view);
        this.resizeAll();
    }

    destroy(removeView?: boolean, stageOptions?: PIXI.IDestroyOptions | boolean) {
        this.stage.removeAllListeners();

        super.destroy(true, true);
    }

    refresh() {
        this.#clear();
        this.#draw();
        this.parent?.refresh();
    }

    resizeAll() {
        const parent = this.parentElement;
        if (!parent) return;

        this.renderer.resize(parent.clientWidth, parent.clientHeight);

        this.#gridLayer.width = this.screen.width;
        this.#gridLayer.height = this.screen.height;

        this.#hitArea.width = this.screen.width;
        this.#hitArea.height = this.screen.height;

        this.render();
    }

    enableNodesInteraction(enabled: boolean) {
        this.#nodesLayer.interactiveChildren = enabled;
    }

    getBoundClientRect(): DOMRect {
        return this.view.getBoundingClientRect();
    }

    getLocalCoordinates(point: Point): Point {
        const viewBounds = this.getBoundClientRect();
        return { x: point.x - viewBounds.x, y: point.y - viewBounds.y };
    }

    getGlobalCoordinates(point: Point): Point {
        const viewBounds = this.getBoundClientRect();
        return { x: point.x + viewBounds.x, y: point.y + viewBounds.y };
    }

    saveTriggers() {
        setSetting("world-triggers", this.#worldTriggers);
    }

    resetTriggers() {
        this.setTrigger(null);
        this.#worldTriggers = this.#getWorldTriggers();
        this.refresh();
    }

    getTrigger(id: Maybe<string>): TriggerData | undefined {
        return id ? this.triggers.get(id) : undefined;
    }

    setTrigger(id: Maybe<string>) {
        if (this.#trigger !== id) {
            this.#clear();
            this.#trigger = id ?? null;
            this.#draw();
        }

        MODULE.debug(this.trigger);

        this.parent?.refresh();
        this.resetPosition();
    }

    async createTrigger({ event, name }: { event: NodeEventKey; name: string }) {
        try {
            const isSubtrigger = event === "subtrigger-input";
            const nodes: TriggerNodeDataSource[] = [
                {
                    key: event,
                    type: isSubtrigger ? "subtrigger" : "event",
                },
            ];

            if (isSubtrigger) {
                nodes.push({
                    key: "subtrigger-output",
                    type: "subtrigger",
                    position: { x: 1000, y: 200 },
                });
            }

            const [trigger] = await this.#worldTriggers.createEmbeddedDocuments("Trigger", [
                { name, nodes },
            ]);

            this.setTrigger(trigger.id);
        } catch (error) {
            MODULE.error("An error occured while creating a new trigger.", error);
        }
    }

    async deleteTrigger(id: string) {
        const [deleted] = await this.#worldTriggers.deleteEmbeddedDocuments("Trigger", [id]);

        if (this.#trigger === id) {
            this.setTrigger(null);
        } else if (deleted.isSubtrigger) {
            this.refresh();
        } else {
            this.parent?.refresh();
        }
    }

    async createNodeFromFilter(
        target: Point,
        entry?: BlueprintEntry
    ): Promise<BlueprintNode | undefined> {
        const trigger = this.trigger;
        if (!trigger) return;

        const groups = this.#getFilterGroups(entry);
        const result = await BlueprintMenu.wait<BlueprintFilterData>({
            blueprint: this,
            groups,
            target,
            classes: ["nodes-menu"],
        });
        if (!result) return;

        const { key, type, variable, subtrigger } = result;
        const data: TriggerNodeDataSource = { type, key };

        if (variable) {
            data.target = variable.target;

            if (key === "variable-getter") {
                data.custom = {
                    outputs: [{ type: variable.type, key: "output" }],
                };
            } else {
                data.custom = {
                    inputs: [{ type: variable.type, key: "input", label: variable.type }],
                    outputs: [{ type: variable.type, key: "value" }],
                };
            }
        } else if (subtrigger) {
            const origin = this.triggers.get(subtrigger.target);
            if (!origin) return;

            data.target = origin.id;
        }

        try {
            const [node] = await trigger.createEmbeddedDocuments("Node", [data]);

            if (node.invalid) {
                throw new Error("invalid document data");
            }

            return this.nodesLayer.add(node);
        } catch (error) {
            MODULE.error("An error occured while creating a new node.", error);
        }
    }

    async createVariable(entry?: BlueprintEntry & { type: NonBridgeEntryType }) {
        const trigger = this.trigger;
        if (!trigger) return;

        const global = !entry;
        const placeholder = entry?.label ?? "";
        const options = global ? NODE_NONBRIDGE_TYPES : [{ value: "", label: entry.type }];

        const result = await waitDialog<{ label: string; type: NonBridgeEntryType }>({
            content: [
                {
                    type: "text",
                    inputConfig: {
                        name: "label",
                        placeholder,
                    },
                },
                {
                    type: "select",
                    inputConfig: {
                        name: "type",
                        options,
                        i18n: "entry",
                        disabled: !global,
                    },
                },
            ],
            i18n: "create-variable",
            skipAnimate: true,
        });

        if (!result) return;

        const type = entry?.type ?? result.type;
        const label = result.label || placeholder || localize("entry", type);
        const variableId =
            entry?.id ?? createEntryId(trigger.event, "outputs", foundry.utils.randomID());

        trigger.addVariable(variableId, { type, label, global });
        this.parent?.refresh();
    }

    async deleteVariable(id: NodeEntryId) {
        const variable = this.trigger?.getVariable(id);
        if (!variable) return;

        const result = await confirmDialog("delete-variable", {
            skipAnimate: true,
            data: variable,
        });

        if (result) {
            this.trigger?.removeVariable(id);
            this.refresh();
        }
    }

    async editVariable(id: NodeEntryId) {
        const variable = this.trigger?.getVariable(id);
        if (!variable) return;

        const result = await waitDialog<{ label: string }>({
            content: [
                {
                    type: "text",
                    inputConfig: {
                        name: "label",
                        value: variable.label,
                        placeholder: localize("entry", variable.type),
                    },
                    groupConfig: {
                        i18n: "create-variable",
                    },
                },
            ],
            i18n: "edit-variable",
            skipAnimate: true,
        });

        if (result && result.label !== variable.label) {
            this.trigger?.update({ variables: { [id]: result } });
            this.refresh();
        }
    }

    getEntry(id: NodeEntryId): BlueprintEntry | undefined {
        return this.nodesLayer.get(id)?.getEntry(id);
    }

    resetPosition() {
        const distance = distanceToPoint(this.stage.position, { x: 0, y: 0 });
        if (distance === 0) return;

        CanvasAnimation.animate(
            [
                this.stage.position,
                this.#gridLayer.position,
                this.#gridLayer.tilePosition,
                this.#hitArea,
            ].flatMap((parent) => ["x", "y"].map((attribute) => ({ parent, attribute, to: 0 }))),
            { duration: distance / 4 }
        );
    }

    #getWorldTriggers(): WorldTriggers {
        return getSetting<WorldTriggers>("world-triggers").clone();
    }

    #getFilterGroups(entry?: BlueprintEntry): BlueprintMenuGroup[] {
        const groups = getFilterGroups();
        const setter = localize("node.variable.setter");

        const entryTarget = entry?.node.data.target;
        const variables: FilterGroupEntry[] = R.pipe(
            this.trigger?.variables ?? {},
            R.entries(),
            R.flatMap(([target, variable]): FilterGroupEntry[] => {
                // we prevent getter & setter to connect to each other
                if (entryTarget && entryTarget === target) {
                    return [];
                }

                const variableData = {
                    ...variable,
                    // we re-add manually otherwise it is gone for some reason
                    type: variable.type,
                    target,
                };

                const outputCompatibles = getCompatibleTypes(variable.type, "outputs");
                const entries: FilterGroupEntry[] = [
                    {
                        type: "variable",
                        key: "variable-getter",
                        inputs: [],
                        outputs: outputCompatibles,
                        label: variable.label,
                        data: dataToDatasetString({
                            type: "variable",
                            key: "variable-getter",
                            variable: variableData,
                        } satisfies BlueprintFilterData),
                    },
                ];

                if (variable.global) {
                    entries.push({
                        type: "variable",
                        key: "variable-setter",
                        inputs: ["bridge", ...getCompatibleTypes(variable.type, "inputs")],
                        outputs: ["bridge", ...outputCompatibles],
                        label: `${variable.label} (${setter})`,
                        data: dataToDatasetString({
                            type: "variable",
                            key: "variable-setter",
                            variable: variableData,
                        } satisfies BlueprintFilterData),
                    });
                }

                return entries;
            }),
            R.sortBy(R.prop("label"))
        );

        if (variables.length) {
            groups.push({
                title: localize("node.variable.title"),
                entries: variables,
            });
        }

        const subtriggers: FilterGroupEntry[] = R.pipe(
            this.trigger?.isSubtrigger ? [] : this.triggers.contents,
            R.filter((trigger) => trigger.isSubtrigger),
            R.map((trigger): FilterGroupEntry => {
                const inputs = (trigger.event.custom?.outputs ?? []).flatMap(({ type }) => {
                    return getCompatibleTypes(type, "inputs");
                });

                const outputs = (
                    trigger.nodes.find(isSubtriggerOutput)?.custom?.inputs ?? []
                ).flatMap(({ type }) => {
                    return getCompatibleTypes(type, "outputs");
                });

                return {
                    type: "subtrigger",
                    key: "subtrigger-node",
                    inputs: ["bridge", ...inputs],
                    outputs: ["bridge", ...outputs],
                    label: trigger.label,
                    data: dataToDatasetString({
                        type: "subtrigger",
                        key: "subtrigger-node",
                        subtrigger: {
                            target: trigger.id,
                        },
                    } satisfies BlueprintFilterData),
                };
            }),
            R.sortBy(R.prop("label"))
        );

        if (subtriggers.length) {
            groups.push({
                title: localize("node.subtrigger.title"),
                entries: subtriggers,
            });
        }

        if (!entry) {
            return groups;
        }

        const entryType = entry.type;
        const oppositeCategory = entry.oppositeCategory;

        return R.pipe(
            groups,
            R.map(({ entries, title, isSub }) => {
                const filtered = entries.filter((filter) => {
                    return filter[oppositeCategory].includes(entryType);
                });

                if (!filtered.length) return;

                return {
                    title,
                    isSub,
                    entries: filtered,
                };
            }),
            R.filter(R.isTruthy)
        );
    }

    #draw() {
        const trigger = this.trigger;
        if (!trigger) return;

        this.nodesLayer.draw();
        this.connectionsLayer.draw();

        this.stage.on("pointerdown", this.#onPointerDown, this);
    }

    #clear() {
        this.nodesLayer.clear();
        this.connectionsLayer.clear();

        this.stage.removeAllListeners();
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 2) return;

        this.#drag = { origin: subtractPoint(event.global, this.stage.position) };

        this.stage.on("pointerup", this.#onPointerUp, this);
        this.stage.on("pointerupoutside", this.#onPointerUp, this);
        this.stage.on("pointermove", this.#onDragMove, this);
    }

    #onDragMove(event: PIXI.FederatedPointerEvent) {
        if (!this.#drag) return;

        const { origin, dragging } = this.#drag;

        if (!dragging) {
            const target = subtractPoint(event.global, this.stage.position);
            const distance = distanceToPoint(target, origin);

            if (distance < 10) return;
        }

        this.#drag.dragging = true;

        const { x, y } = subtractPoint(event.global, origin);

        this.#hitArea.x = -x;
        this.#hitArea.y = -y;

        this.stage.cursor = "grabbing";
        this.stage.position.set(x, y);

        this.#gridLayer.position.set(-x, -y);
        this.#gridLayer.tilePosition.set(x, y);
    }

    async #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const wasDragging = !!this.#drag?.dragging;

        this.#drag = null;
        this.nodesLayer.interactiveChildren = true;

        this.stage.cursor = "default";
        this.stage.off("pointerup", this.#onPointerUp, this);
        this.stage.off("pointerupoutside", this.#onPointerUp, this);
        this.stage.off("pointermove", this.#onDragMove, this);

        if (!wasDragging && this.trigger) {
            this.#onContextMenu(event.global);
        }
    }

    async #onContextMenu({ x, y }: Point) {
        const node = await this.createNodeFromFilter({ x, y });
        if (!node) return;

        const center = { x: x - node.width / 2, y: y - node.height / 2 };
        const point = subtractPoint(center, this.stage.position);
        node.setPosition(point);
    }

    #onDropCanvasData(event: DragEvent) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

        if (
            !R.isString(data.type) ||
            !R.isString(data.uuid) ||
            !["Item", "Macro"].includes(data.type)
        )
            return;

        const document = fromUuidSync<BlueprintDropDocument>(data.uuid);
        if (!document) return;

        const localPoint = this.getLocalCoordinates(event);

        for (const node of this.nodesLayer.nodes()) {
            const dropped = node.onDropDocument(localPoint, data.type, document);
            if (dropped) return;
        }
    }
}

type BlueprintDropDocument = ItemPF2e | MacroPF2e | CompendiumIndexData;

type BlueprintFilterData = {
    type: NodeType;
    key: NodeKey;
    variable?: TriggerDataVariable & {
        target: NodeEntryId;
    };
    subtrigger?: {
        target: string;
    };
};

export { Blueprint };
export type { BlueprintDropDocument };
