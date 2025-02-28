# 1.1.0

-   add `Collapse` button to the top right of the triggers menu window
    -   the `Expand` button then shows in the top left corner of your browser
-   add `Actor Data` splitter node
    -   it extract some data from the target actor: `Name` and `Level`
-   add `Item Data` splitter node
    -   it extract some data from the item: `Name`, `Slug` and `Level`
-   rename splitters input to match the type instead of "input"

# 1.0.0

-   add custom variables
    -   you can now create variables from any output value connection
    -   once a variable is created, you can instantiate it in your trigger as many time as needed
-   add `Scene Region` event node
    -   this event will be directly available in the scene region behavior list
    -   you can use any behavior event that involve tokens
    -   the node context menu has a `Copy ID` option to copy the trigger ID needed in the region behavior
-   add `Reduce Condition` action node
    -   let you reduce a non-locked condition on a target by a certain amount with the possibility of capping it to a minimum
    -   it will reduce all the conditions of that type on the target

# 0.13.1 (beta)

-   add more checks to data validation to avoid breaking errors
-   make sure the `Execute Event` & `Test Event` can only be executed by the active GM

# 0.13.0 (beta)

-   rework of the `Export` feature
    -   the module will warn you if the exported trigger make use of any sub-trigger and offer you to export them as well
-   rework of the `Export All` feature
    -   you will now be presented with an export manager window
    -   selecting/unselecting the different triggers/sub-triggers will prompt you with different messages allowing you to automatically select/unselect the related sub-triggers/triggers
-   rework of the `Import` feature
    -   you will be warned if your world already has sub-triggers with the same ID as the ones you are currently importing and asked if you want to override them or not
-   add `Execute Event` custom event node
    -   allows you to trigger a node on demand (i.e. via macro)
    -   accessible from `game.trigger.execute(triggerId, target, values)`
-   add `Console Log` custom action node
    -   will log in the console any input fed to it (plus the `Trigger Target`)
-   add `Add Immunity`, `Add Resistance` & `Add Weakness` action nodes
    -   create an effect hosting the associate RE on the target
    -   the node context menu has a `Add Exception` option
    -   the `Add Resistance` node context menu has a `Add Double Vs` option
-   add `Remove Immunity` action node
    -   create an effect hosting an immunity removal RE on the target
    -   this cancel an immunity already existing on the target
-   add `Add Trigger Effect` action node
    -   this creates a custom effect linked to the trigger which can then be used to predicate upon
    -   useful if you want to prevent the trigger from being executed on the target for a time
    -   use a simple `slug`, no need to over complicate things since the effect is isolated for that trigger alone
    -   the node context menu contains a `Copy Roll Option` option in case you ever wanted to predicate upon the effect via another way than the `Has Trigger Effect`
-   add `Remove Trigger Effect` action node
    -   it removes an effect added with `Add Trigger Effect` with the same `slug`
    -   in case the effect doesn't use duration
-   add `Has Trigger Effect` condition node
    -   this is the node you would use to predicate upon the trigger effect from inside trigger itself
-   remove `Item Convertor` from the list of nodes
-   remove `dying`, `persistent-damage` & `unconcious` from the `Add Condition` action node options
-   nodes can now have labels between connections
-   add scrolling to select menus
-   custom nodes inputs will now contain a field instead of being a pure connection
-   make sure connected selects only return a valid select option value
-   fix DC values being maxed at `30` for complete arbitrary reason
-   fix `Roll Save` action not skipping the modifier dialog
-   fix system bug with certain conditions using `inMemoryOnly`

# 0.12.1 (beta)

-   fix conditions always being created behind a locking effect even when not using any options requiring it

# 0.12.0 (beta)

-   add `Origin` to the `Duration (Unit)` value node
    -   used to set the effect actor origin
-   add new `Add Persistent Damage` action node
-   fix auras without any effect not being handled by the module

# 0.11.0 (beta)

-   change workflow of triggers and nodes instantiation
-   fix issue with sub-trigger returned values being lost in the ether

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
