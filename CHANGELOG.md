# 0.10.0 (beta)

-   complete rewrite of the module
-   bridge connections (the white "triangles") no longer carry any context with them, the module now fully works with variables instead
    -   unique nodes (e.g. `Event`s and the `Is Inside Aura` condition) will automatically generate global variables
    -   custom variables will most likely see the day in a future update
-   you can now create `Sub-Trigger`s
    -   they are a subset of a regular `Trigger` without being attached to any specific event
    -   you can customize the `Input` & `Output` nodes of a `Sub-Trigger` to contain any type of connection
    -   once a `Sub-Trigger` is created, it can be used in any regular `Trigger` as a node
    -   unique nodes cannot be used inside a `Sub-Trigger` for obvious reason
-   `Run Macro` isn't an action node anymore but its own type
    -   you can customize the inputs out outputs connections of a macro node
    -   the `actor` & `token` arguments of the macro are now always the `Trigger Target`'s
    -   inputs are sent to the macro as an array available in the macro context as `values`
    -   to feed back values from the macro to the macro node, you need to return an array
    -   both the input & output arrays correspond to the custom connections added (in the same order), they don't include immutable connections from the module (e.g. the `Source UUID` connection)
-   `Splitter` are now their own node type and make use of the bridge connections
-   `Logic` nodes now make use of the bridge connections
-   add new `Converter` node type
    -   though only one exist as of now and its use is pretty much useless
    -   the module is smart enough to auto apply converters when needed and allows a one-step remove connection
-   Due to the drastic changes, previous data will unlikely be compatible, you can either delete them before updating the module or type the following command in your console:
    -   `game.settings.set("pf2e-trigger", "triggers", [])`

# 0.9.0 (beta)

-   big refactor of the core logic to support variables
    -   certain nodes will now set variables for the duration of the trigger process
    -   a variable is accessible as a pseudo-node and its accessor can be instantiated as many time as needed
    -   variables allow you to setup action nodes (such as `Roll Damage`) with a different `target` or `origin`, making them less rigid (before, an action would always be executed with the triggering actor as origin)
-   no longer allow a bridge input to be connected to multiple nodes
-   triggers can now be enabled/disabled in the menu
-   add `Convert` option to trigger events
    -   some conflicting nodes could be removed from the trigger (and their associated variables) during conversion
-   add `Duplicate` option to nodes
-   add `Test Event` event node
    -   type `game.trigger.test()` in the console with a selected token to run the `Test Event` triggers
-   add `Add Condition` action node
-   add `Roll Data` value node
-   add `Effect Duration (Encounter)`, `Effect Duration (Unlimited)` and `Effect Duration (Unit)` value nodes
-   add `Difficulty Class (DC)` and `Difficulty Class (Target)` value nodes
-   add `Degree of Success (Splitter)` logic node
-   add `Duration`, `Roll` and `DC` connections
-   finish implementing the `Number` value node
-   `Roll Damage` & `Roll Save` now make use of the `Roll Data` node
    -   this allow you to set the origin actor, but also to add extra `options` and `traits`
-   `Roll Save` now make use of the `Difficulty Class` nodes
-   fix world items not always working in the `Item Source` node
-   fix uncached items never being returned by `Item Source`

# 0.8.0 (beta)

-   complete redo of the module

# 0.7.0 (alpha)

-   add type lookup to item retrieval to improve performance

# 0.6.0 (alpha)

-   add `Remove Item` trigger action
-   fix aura not being removed from memory

# 0.5.1 (alpha)

-   add cache to `runTrigger`
-   test for auras are rejected if the actor isn't the current combatant of an encounter

# 0.5.0 (alpha)

-   first beta release
