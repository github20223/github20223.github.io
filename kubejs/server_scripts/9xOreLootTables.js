 
// KubeJS, no LootJS
// Can't check for enchants here, would have to use block break events
// ServerEvents.blockLootTables
// (
//     event =>
//     {
//         // Diamond ore drops tech reborn diamond nuggets
//         event.addSimpleBlock('minecraft:diamond_ore', 'techreborn:diamond_nugget')
//         event.addBlock
//         ('minecraft:deepslate_diamond_ore',
//             table =>
//             {
//                 table.addPool
//                 (
//                     pool =>
//                     {
//                         pool.addItem('techreborn:diamond_nugget')
//                     }
//                 )

//                 table.addPool
//                 (
//                     pool =>
//                     {
//                         pool.randomChanceWithLooting(1/3, 2)
//                         pool.addItem('techreborn:diamond_nugget')
//                     }
//                 )
//             }
//         )
//     }
// )

// LootJS
let EquipmentSlot = Java.loadClass("net.minecraft.world.entity.EquipmentSlot")

let diamondOreItemDrop = "techreborn:diamond_nugget"

LootJS.modifiers
(
    event => 
    {
        event.enableLogging();

        // Diamond ore drops Tech Reborn Diamond Nuggets
        // Works with fortune
        event
        .addBlockLootModifier("minecraft:diamond_ore")
        //.matchLoot("minecraft:diamond")
        //.matchEquip(EquipmentSlot.MAINHAND, ItemFilter.hasTier('iron'))
        //.matchEquip(EquipmentSlot.MAINHAND, ItemFilter.hasEnchantment("fortune", 1, 1))
        // The last argument true preserves the stack size, this maintains the effects of the fortune enchantment 
        // as well as the required tool tier without any extra work required on my part.
        .replaceLoot("minecraft:diamond",  "techreborn:diamond_nugget", true)
        //.dropExperience(-7) // Don't know if I can disbale experience drops, want to reduce them
        //.applyBonus("minecraft:fortune", 1)

        event
        .addBlockLootModifier("minecraft:deepslate_diamond_ore")
        .replaceLoot("minecraft:diamond",  "techreborn:diamond_nugget", true)

        event
        .addBlockLootModifier("denseores:dense_diamond_ore")
        .replaceLoot("minecraft:diamond",  "techreborn:diamond_nugget", true)

        event
        .addBlockLootModifier("denseores:dense_deepslate_diamond_ore")
        .replaceLoot("minecraft:diamond",  "techreborn:diamond_nugget", true)

        // Replace emerald ore drops with Tech Reborn Emerald Nuggets
        
        event
        .addBlockLootModifier("minecraft:emerald_ore")
        .replaceLoot("minecraft:emerald",  "techreborn:emerald_nugget", true)

        event
        .addBlockLootModifier("minecraft:deepslate_emerald_ore")
        .replaceLoot("minecraft:emerald",  "techreborn:emerald_nugget", true)

        event
        .addBlockLootModifier("denseores:dense_emerald_ore")
        .replaceLoot("minecraft:emerald",  "techreborn:emerald_nugget", true)

        event
        .addBlockLootModifier("denseores:dense_deepslate_emerald_ore")
        .replaceLoot("minecraft:emerald",  "techreborn:emerald_nugget", true)
    }
);