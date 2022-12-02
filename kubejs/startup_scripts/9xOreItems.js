StartupEvents.registry
(
    "item",
    event =>
    {
        // NOTE: Turns out I dont need this, theres already minecraft:raw_iron_block
        // Can carry 64 Raw Iron, so max stack size of Raw Iron Pile is 64 / 9 which is ~7.1,
        // I'll round up so that its slightly more convenient to carry piles than it is a stack of Raw Iron.
        // event.create("raw_iron_pile").displayName("Raw Iron Pile").maxStackSize(8)
        
    }
)
