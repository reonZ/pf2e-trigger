# 2.1.0

-   add French localization (thanks to [rectulo](https://github.com/rectulo))
-   add `Object` connection
    -   this node connection doesn't serve any core role in the module as it represents a non-typed javascript object
    -   this can however be fed to a `Run Macro` node or extracted further with the new `Extract Data (Object)`
-   add `Add Numbers` and `Subtract Numbers` actio nodes
    -   it simply returns the result of the operation, it doesn't automatically set a variable (you would need to use a setter)
-   add `Extract Data (Object)` splitter node
    -   allows you to extract arbitrary data from an `Object` type
-   add `Scene Tokens` action node
    -   it will loop over every token on the scene
-   add `Break Process` action node
    -   this will break the process of the trigger stopping any loop currently running
-   add `Get Distance Between` action node
    -   calculates the distance between 2 tokens
    -   it uses the destination coordinates in case the tokens are still in motion on the board
-   add `Is In Range` condition node
    -   it will calculate the distance between 2 tokens while using their updated destination coordinates
-   add `Attack Rolled` event node
    -   this event is only triggered if the attack has a target
-   add `Token Moved` event node
    -   like other token related events, the `Trigger Target` is certain to contain the `token`
    -   the event provides the movement data of the `moveToken` hook
        -   the data is duplicated and will not be mutated further by any other context using it nor will they receive any mutation done to it

# 2.0.0

-   this is a foundry `13.344` and system `7.1.0` release
-   despite the overall design remaining the same, almost nothing was kept from the v1 version
-   due to the drastic changes in data, no migration is being made to try to make your v1 triggers compatible with it
-   your v1 triggers while not usable still exist in your world if you somehow want to get the json (but don't try to import them)
    -   `game.settings.storage.get("world").find(x => x.key === "pf2e-trigger.triggers")`

# 1.8.0

-   this is gonna be the last v1 release
    -   note that v2 will sadly not be compatible with v1 so be prepared to re-do everything when it comes out
-   add `List Matches Predicate` condition node
    -   it will run a predicate test on the provided list
    -   the predicate format must be the same as the one you would provide to a system `Rule Element`

# 1.7.0

-   add support for module specific node
-   add `Roll Damage With Save` toolbelt action node
    -   rolls a damage while adding the necessary data to have an inline save added to it
    -   useful if you don't want to roll the save and damage in succession and instead use the toolbelt target-helper workflow
    -   this requires the latest `PF2e Toobelt` version to work flawlessly
-   `Damage Taken` & `Damage Dealt`:
    -   are no longer restricted to trigger when the target actually receive damage
    -   add a new `No Damage?` variable that indicate when damage has been completely negated
-   `Roll Save`:
    -   add `Is Basic?` input to flag the roll as basic save

# 1.6.2

-   `Add Item`:
    -   make sure the added item is provided a `_stats.compendiumSource` to avoid world items without source id be a problem

# 1.6.1

-   make sure the blueprint background is always the one expected even when using styling modules
-   fix blueprint grid scaling improperly with device resolution aspect ratio other than `1`

# 1.6.0

-   due to changes in data structure, the module will need to run a migration
    -   the module will also migrate triggers when they are imported
-   accentuate some of the connections' color to to make them easier to differentiate
-   rename event nodes to use past tense instead (except `Test Event` & `Execute Event`)
-   rename the `Damage Received` & `Heal Received` event nodes to `Health Gained` & `Health Lost`
    -   this should make it more obvious what the events actually do
    -   also changed their icons
-   rename the `Difficulty Class (DC)` value node to `Difficulty Class`
    -   rename its input to `Value` instead of `DC`
    -   add connection to the input
-   add a way to create global trigger variables
    -   those variables are not linked to any node output
    -   they can be set at any point in the trigger using the `<variable> (Setter)` nodes
-   add `Trigger Variables` section to the menu sidebar
    -   you can rename and delete any custom variable
    -   it doesn't include `unique` variables
    -   remove `Delete Variable` from the variable nodes context menu
-   add new `list` type/connection
    -   it holds an array of strings (e.g. roll options)
-   add `List Contains Value` condition node
    -   look up if an an exact match of value is found in the list (value is trimmed)
-   add new types to the list of extractables in the `Actor Data` & `Item Data` splitter nodes
    -   `list`: if the path leads to a set, it will be converted to an array
    -   `target`: the path can lead to an actor OR a token/token document that has a valid actor
-   add connection to the `Adjustment` input of the `Difficulty Class (Target)`
-   add new `Current Turn?` option to `Aura Entered` & `Aura Left` event nodes
    -   the option is enabled by default so nothing has to be changed to keep the previous behaviour
    -   disabling it will stop enforcing the "it must be the target's turn to be triggered", allowing more versatility
    -   the events still require the target to be in combat
-   add `Damage Taken` & `Damage Dealt` event nodes
    -   those events only trigger from damage messages
    -   they will only trigger if actual damage was dealt/received
    -   they do the exact same thing but reverse the `Trigger Target` and the "other" target in case you need to use `Is Inside Aura` which can only be done on the `Trigger Target`
-   add `Update Effect Duration` action node
    -   update any effect that uses duration to be offset by `x` of the used unit
-   add `Equals (Actor)` logic node
    -   it compares the uuid of two target actors
-   no longer collapse the sidebar automatically
-   prevent a `preUpdateItem` hook from being registered when not needed
-   fix `Add Item` action node always adding the item to the `Trigger Target` instead of the `Target`

# 1.5.0

-   you can now have condition nodes following action nodes
-   add `Damage Received` event node
    -   triggers when an actor loses HP (`0` included), be it from manual update in the sheet/HUD or via a message damage button
    -   it only works for stamina if this was initiated via a message damage button (i opened an issue to the system)
-   add `Heal Received` event node
    -   works just as `Damage Received` but triggers when an actor gains HP
-   add `Gain Item` & `Lose Item` event nodes
    -   if no uuid is provided, it will trigger for any item added or removed from an actor
-   add `Gain Condition` & `Lose Condition` event nodes
    -   will trigger when the specified condition is gained or lost on an actor
    -   the `With Update?` toggle indicate if the trigger should also check for condition counter updates and not just for its existence on the actor
-   add `Is In Combat` condition node
    -   this is implied for the `Trigger Target` when using the `Enter Aura`, `Leave Aura`, `Turn Start` & `Turn End` event nodes
-   add `Is Current Combatant` condition node
    -   this is implied for the `Trigger Target` when using the `Enter Aura`, `Leave Aura` & `Turn Start` event nodes
-   add `Has Condition` condition node
    -   you can set a minimum counter value to test
-   add `Get Current Combatant` action node
    -   returns a `target` type value of the current combat, current combatant if any
-   the `Add Condition` action node can now add the `dying` and `unconscious` conditions
    -   the `Unidentified?` & `Duration` fields won't work with them because of how they are handled by the system
-   turn `Actor Data` & `Item Data` splitter nodes into custom nodes
    -   you can now decide which data is extracted from those documents
    -   this means that any such node you have used so far will have to be modified (i really don't want to do migration for them)
    -   `Entry Path` is the path to a `boolean`, `string` or `number` directly from the root of the document e.g.:
        -   `level` would access the level getter of the document
        -   `system.details.ancestry.name` would retrieve the name of the ancestry of the actor in `Actor Data`

# 1.4.0

-   logic nodes now all have input fields instead of just plain connections
-   rename the `Equals` logic node to `Equals (Number)`
-   add `Equals (Text)` logic node
-   add `Get Item ChoiceSet` action node:
    -   retrieve the `ChoiceSet` selection of the provided embedded item
    -   you can use the `flag` & `rollOption` fields to find the right RE if more than one exist on the item
-   add `String List` custom splitter node
    -   allow you to define a list of bridge outputs branching out from a `text` input
-   fix `Console Log` action node not executing the next node

# 1.3.0

-   this is a system `6.10.0` release
-   no longer disable the `Show token icon?` option from the effects added by the module
    -   the latest system changes now also hides the effect from the `Effects Panel`

# 1.2.0

-   change some of the window tooltips
-   modify the `Close Window` popup content and behavior
    -   clicking the `x` will now cancel the closing of the triggers window
-   rename the `trigger-slug` field to `identifier` for `Trigger Effect` related nodes
    -   the field really never required a slug but any text to identify the effect
    -   you can now also connect the field with another node
-   add `Save Triggers` button to the top right corner of the window
    -   allows saving the triggers without having to close the window
    -   this should also (hopefully) make it clear to people that triggers need to be saved before they can be used
-   add `Reset Triggers` button to the top right corner of the window
    -   will reset your triggers to their last saved state
-   add `UUID` output to the `Actor Data` & `Item Data` splitter nodes
    -   this could be used as an identifier to narrow down the context of a `Trigger Effect`, allowing conditional logic against a specific actor/item instead of the whole trigger
-   fix not being able to connect connections with the same value type to other connection types
    -   the module internally distinguish `text`, `uuid` and `select` entries while all 3 are technically `string`, this fix not being able to connect them with each others even though it was always intended (they even have the same color)

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
