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
