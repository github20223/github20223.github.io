ServerEvents.recipes
(
    event =>
    {
        event.remove({output: 'minecraft:copper_ingot'})
        event.remove({output: 'minecraft:iron_ingot'})
        event.remove({output: 'minecraft:gold_ingot'})

        // Remove Enhanced Quarries stuff
        event.remove({output: "enhanced_quarries:normal_quarry"})
        event.remove({output: "enhanced_quarries:enhanced_quarry"})
        event.remove({output: "enhanced_quarries:fluid_quarry"})

        // Remove Quarry Plus stuff
        event.remove({output: "quarryplus:quarry"}) // Quarry Plus
        event.remove({output: "quarryplus:adv_quarry"}) // Chunk Destroyer

        event.remove({input: 'minecraft:raw_copper_block', output: 'minecraft:copper_block'})
        event.remove({input: 'minecraft:raw_iron_block', output: 'minecraft:iron_block'})
        event.remove({input: 'minecraft:raw_gold_block', output: 'minecraft:gold_block'})
        //   OUTPUT, INPUT, EXP, TICKS (minecraft is 20 ticks per second)
        //   Iron ingot: Gives 0.7 exp so 0.7 / 9.0. Takes 10 seconds to cook so 10s / 9s
        event.smelting(/.*:copper_nugget/, 'minecraft:raw_copper', 0.7 / 9.0, 200.0 / 9.0)
        event.smelting('minecraft:copper_ingot', 'minecraft:raw_copper_block', 0.7, 200)

        event.smelting('minecraft:iron_nugget', 'minecraft:raw_iron', 0.7 / 9.0, 200.0 / 9.0)
        event.smelting('minecraft:iron_ingot', 'minecraft:raw_iron_block', 0.7, 200)

        event.smelting('minecraft:gold_nugget', 'minecraft:raw_gold', 0.7 / 9.0, 200.0 / 9.0)
        event.smelting('minecraft:gold_ingot', 'minecraft:raw_gold_block', 0.7, 200)

        // Nuggets to ingot
        event.shaped
        (
            'minecraft:copper_ingot', 
            [
                'NNN',
                'NNN',
                'NNN'
            ], 
            {
                N: 'techreborn:copper_nugget'
            }
        )
        event.shaped
        (
            'minecraft:copper_ingot', 
            [
                'NNN',
                'NNN',
                'NNN'
            ], 
            {
                N: 'consistency_plus:copper_nugget'
            }
        )
        event.shaped
        (
            'minecraft:iron_ingot', 
            [
                'NNN',
                'NNN',
                'NNN'
            ], 
            {
                N: 'minecraft:iron_nugget'
            }
        )
        event.shaped
        (
            'minecraft:gold_ingot', 
            [
                'NNN',
                'NNN',
                'NNN'
            ], 
            {
                N: 'minecraft:gold_nugget'
            }
        )

        // Ingot from blocks
        event.shaped
        (
            '9x minecraft:copper_ingot',
            'minecraft:copper_block'
        )
        event.shaped
        (
            '9x minecraft:iron_ingot', 
            'minecraft:iron_block'
        )
        event.shapeless
        (
            '9x minecraft:gold_ingot',
            'minecraft:gold_block'
        )

        // VSAS Compat

        event.shaped
        (
            'minecraft:oak_boat', 
            [
                'WSW',
                'WWW'
            ], 
            {
                W: 'minecraft:oak_planks',
                S: 'vsas:shovels/oak_wooden_shovel'
            }
        )
        

        // Match the Enhanced Quarries and Quarry Plus quarry recipes to Quarry Reborns quarry recipe.
        event.shaped
        (
            "enhanced_quarries:normal_quarry",
            [
              "CMC",
              "EIE",
              "SDS"
            ],
            {
              "C": "techreborn:advanced_circuit",
              "M": "techreborn:advanced_machine_frame",
              "E": "techreborn:extractor",
              "I": "#c:iridium_ingots",
              "S": "#c:steel_plates",
              "D": "techreborn:advanced_drill"
            }
        )

        event.shaped
        (
            "quarryplus:quarry",
            [
              "CMC",
              "EIE",
              "SDS"
            ],
            {
              "C": "techreborn:advanced_circuit",
              "M": "techreborn:advanced_machine_frame",
              "E": "techreborn:extractor",
              "I": "#c:iridium_ingots",
              "S": "#c:steel_plates",
              "D": "techreborn:advanced_drill"
            }
        )


    }
)