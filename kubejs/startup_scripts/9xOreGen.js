// priority: 0

console.info("Hello, World! (You will only see this line once in console, during startup)")

StartupEvents.registry("item", event => {
	// Register new items here
	// event.create("example_item").displayName("Example Item")
})

StartupEvents.registry("block", event => {
	// Register new blocks here
	// event.create("example_block").material("wood").hardness(1.0).displayName("Example Block")
})

// Ore will smelt into nuggests instead of ingots, meaning you will need 9 times the ore to create a single ingot
// and it will cost you 9 times the durability of a pick per ingot.

// 1 ore smelts into a nugget.  Fuel used is divided by 9.
// Craft 9 ore to create an ore pile then smelt that, which results in 1 ingot. Takes the same amount of fuel as 1 ore in vanilla.
// Craft 9 ore piles to create a large ore pile which when smelted results in 1 block. Takes the same amount of fuel smelting 9 ore does in vanilla.

// The intention is to create a more engaging mining experience. I feel that ore in 1.18+ is too rare, and digging 
// through a bunch of stone and dirt isn"t as fun as mining a bunch of ore. 
// I can see how the rarity could give you an extra feeling of accomplishment once you finally get the ore. 
// but even after considering that I still find the ore to be too rare.

// Problem: You never explore an entire chunk, so per chunk you typically get only a small fraction of what ore is
// available, this problem also applies to quarry mods, which enable you to mine entire chunks, which is typically 
// something you dont do.
// We need to *find* 9 times more ore, it doesnt matter if there actually is 9 time more ore.
// And this will also help balance quarries, rather then mining an entire chunk being something thats a bit overpowered
// it will result in only a little more than mining by hand. Its automated so time is what you gain.
// So the question becomes, how much ore do you typically *find* per chunk in vanilla?
// Ore veins 9 times the size will almost guarentee you find 100% of it. 
// I want to scale down the amount of veins by the fraction that you would typically find per chunk in vanilla.
// The idea is that the veins will be large enough that you will generally find 100% of the ore per chunk.
// I usualy branch mine a 3 block tall mine at iron (16, feet at 15), and at bedrock. 
// Ignoring mountains the amount of a chunk that normally is solid is from about 80 to -61 so 141 blocks.
// Ores exposed on the surface (1), and my two branch mines (6) account for very roughly 7 out of the 141 block layers
// then theres caves and mineshafts, and I have no idea how to approximate that, but I almost never find ore in caves, 
// and if I do  its the ore_iron_small, so about 3-5 blocks. 
// But it still counts.. So ill just guess that caves and mineshafts add ~20 block layers
// making typically explored block layers per chunk 27 out of 141 or 19.14893617021277%.
// I"ll round up and say its 20%.
// So I"ll multiply the number of veins (times 2) by 0.2



// Remove all ores (not coal) and replace them with generation that produces 9 times the amount of ore
// I am choosing to scale the vanilla vein size by 4.5 and the number of veins by 2
WorldgenEvents.remove
(
	event => 
	{
		//console.info("HELP")
		//console.debugEnabled = true;

		// print all features for a given biome filter
		//event.printFeatures()


		// ??BUG?? For some reason this doesnt remove the large iron ore veins in deepslate
		// according to the IRON_ORE_TARGETS in OreGeneratedFeatures, it should be...
			// event.removeFeatureById("underground_ores", 
			// [
			// 	"minecraft:ore_iron_upper",
			// 	"minecraft:ore_iron_middle",recip
			// 	"minecraft:ore_iron_small",
			// 	//"minecraft:",
			// ])

		// This method seems to work, confirmed with Xray mod.
		event.removeOres((props) => {
			props.worldgenLayer = "underground_ores"
			// ? There still seems to be some small pockets, and the big veins of deepslate_iron_ore spawning?
			// Maybe those occur in a different layer? Or maybe a mod is adding them? I can"t find any reference
			// to this in the minecraft source, althought I know its supposed to be something that rarely happens
			// at least for copper.. don"t know about iron though, so it might be a mod.
			// This also happens with copper, the large veins arent removed, so they must be in another step
			props.blocks =
			[
				"minecraft:copper_ore",  "minecraft:deepslate_copper_ore",
				"minecraft:iron_ore",    "minecraft:deepslate_iron_ore",
				"minecraft:gold_ore",    "minecraft:deepslate_gold_ore",
				"minecraft:diamond_ore", "minecraft:deepslate_diamond_ore",
				"minecraft:emerald_ore", "minecraft:deepslate_emerald_ore"
			] 
		})


		// Remove dense ores to be replaced with custom generation
		event.removeOres((props) => {
			props.worldgenLayer = "underground_decoration"
			props.blocks =
			[
				"denseores:dense_copper_ore",  "denseores:dense_deepslate_copper_ore",
				"denseores:dense_iron_ore",    "denseores:dense_deepslate_iron_ore",
				"denseores:dense_gold_ore",    "denseores:dense_deepslate_gold_ore",
				"denseores:dense_diamond_ore", "denseores:dense_deepslate_diamond_ore",
				"denseores:dense_emerald_ore", "denseores:dense_deepslate_emerald_ore"
			] 
		})
	}
)

/**
 * NOTE: Cant have veins larger than 64 ore each, the error will look something like this:
 * 		"Error adding element: Value 162 outside of range [0:64]""
 */
WorldgenEvents.add
(
	event => 
	{
		//(1 ore smelts into 1 nugget, so 9 ore = 1 ingot)
		 
		// Double the number of veins per chunk
		let numVeinsMult = 2.0;
		// 4.5 times the amount of ore 
		let veinSizeMult = 4.5; 

		// Resulting in 9 times the ore

		// The percentage of ore typically found per chunk in vanilla (rough)
		// This is used to scale the number of veins, after scaling them by the numVeinsMult
		// So that the amount of ore per chunk will be roughtly the amount you typically find per chunk in vanilla
		// The assumption is that you will find ~100% of the ore per chunk since the veins are so massive. 
		// This also results in more balanced quarries.
		let percentFound = 0.15; // 15%
		
		let rareDenseOreVeinSizeMult = 2.0/3.0;
		let commonDenseOreVeinSizeMult = 1.0/3.0;

		const {anchors} = event

		// 2022-11-25, this generates A LOT of ore, it -might- be too much once the other ores are added in, but alone
		// it isn"t too bad. If it does turn out to be too much I can try a few things, less veins per chunk, but larger
		// veins (probably best), or change the recipe for an ingot made of nuggets to take a smaller number of nuggets (meh), or make an intermediate item that ore cooks into, that is the equavalent of x nuggets each (lets say 3) then have 3 of them crafted together create an ingot. or something like that, 3 of them together creates a stack (like tech reborn alloy), then smelt that to get an ingot.. there are plenty of options, can always increase coal spawn slghtly to compensate for extra smelting requirement.

		//
		// Add ore features matching Vanilla but scaled by the above factors.
		// TODO: Add the biome specific extra ores, right now KubeJS is broken andd will not accept biome ids, only tags.
		//

		//
		// Add Copper ore features.
		//

		// ore_copper
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:ore_copper"
					ore.biomes = "#minecraft:is_overworld"//"#minecraft:is_overworld"  // This is all fucked up, The only thing that works is 
					// biome tags, it doesnt accept single biomes.
					// regex was working before, now its not, the "not" map doesnt work, so im just leaving it
					// for now, I"ll try setting up biome specific ores at a later date.


					ore.addTarget("minecraft:stone", "minecraft:copper_ore") 
					ore.addTarget("minecraft:deepslate", "minecraft:deepslate_copper_ore") 
					ore.count((16 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.absolute(-16),
							anchors.absolute(112)
						)	
					ore.size = 10 * veinSizeMult
					ore.noSurface = 0.0
					ore.worldgenLayer = "underground_ores" 
					ore.chance = 0
				}
		)
		
		// TODO:
		// Cannot add yet, targeting specifc biomes doesnt work I guess, it did work, but then it didnt so i dont know.
		// // ore_copper_large (replaces generation in dripstone caves, not in addition)
		// event.addOre
		// (
		// 	ore => 
		// 		{
		// 			ore.id = "ninetimes:ore_copper"
		// 			ore.addTarget("minecraft:stone", "minecraft:copper_ore") 
		// 			ore.addTarget("minecraft:deepslate", "minecraft:deepslate_copper_ore") 
		// 			ore.count((16 * numVeinsMult) * percentFound)  
		// 				.squared() 
		// 				.triangleHeight
		// 				(
		// 					anchors.absolute(-16),
		// 					anchors.absolute(112)
		// 				)	
		// 			ore.size = 10 * veinSizeMult
		// 			ore.noSurface = 0.0
		// 			ore.worldgenLayer = "underground_ores" 
		// 			ore.chance = 0
		// 		}
		// )
		
		//
		// Add dense copper ore features
		// 

		
		// dense_ore_copper
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:dense_ore_copper"
					ore.biomes = "#minecraft:is_overworld"

					ore.addTarget("minecraft:copper_ore", "denseores:dense_copper_ore") 
					ore.addTarget("minecraft:deepslate_copper_ore", "denseores:dense_deepslate_copper_ore") 
					ore.count((16 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.absolute(-16),
							anchors.absolute(112)
						)	
					ore.size = 10 * veinSizeMult * commonDenseOreVeinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_decoration" 
					ore.chance = 0
				}
		)

		//
		// Add gold ore features.
		//

		// ore_gold
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:ore_gold"
					ore.biomes = "#minecraft:is_overworld"

					ore.addTarget("minecraft:stone", "minecraft:gold_ore") 
					ore.addTarget("minecraft:deepslate", "minecraft:deepslate_gold_ore") 
					ore.count((4 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.absolute(-64),
							anchors.absolute(32)
						)	
					ore.size = 9 * veinSizeMult
					ore.noSurface = 0.5
					ore.worldgenLayer = "underground_ores" 
					ore.chance = 0
				}
		)

		// ore_gold_lower
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:ore_gold_lower"
					ore.biomes = "#minecraft:is_overworld"

					ore.addTarget("minecraft:stone", "minecraft:gold_ore") 
					ore.addTarget("minecraft:deepslate", "minecraft:deepslate_gold_ore") 
					ore.count([0, (1 * numVeinsMult) * percentFound ])  
						.squared() 
						.uniformHeight
						(
							anchors.absolute(-64),
							anchors.absolute(-48)
						)	
					ore.size = 9 * veinSizeMult
					ore.noSurface = 0.5
					ore.worldgenLayer = "underground_ores" 
					ore.chance = 0
				}
		)

		// TODO: ore_gold_extra
		
		//
		// Add Dense Gold Ore features.
		//

		// dense_ore_gold
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:dense_ore_gold"
					ore.biomes = "#minecraft:is_overworld"

					ore.addTarget("minecraft:gold_ore", "denseores:dense_gold_ore") 
					ore.addTarget("minecraft:deepslate_gold_ore", "denseores:dense_deepslate_gold_ore") 
					ore.count((4 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.absolute(-64),
							anchors.absolute(32)
						)	
					ore.size = 9 * veinSizeMult * rareDenseOreVeinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_decoration" 
					ore.chance = 0
				}
		)

		// dense_ore_gold_lower
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:dense_ore_gold_lower"
					ore.biomes = "#minecraft:is_overworld"

					ore.addTarget("minecraft:gold_ore", "denseores:dense_gold_ore") 
					ore.addTarget("minecraft:deepslate_gold_ore", "denseores:dense_deepslate_gold_ore") 
					ore.count([0, (1 * numVeinsMult) * percentFound ])   
						.squared() 
						.uniformHeight
						(
							anchors.absolute(-64),
							anchors.absolute(-48)
						)	
					ore.size = 9 * veinSizeMult * rareDenseOreVeinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_decoration" 
					ore.chance = 0
				}
		)

		// TODO: dense_ore_gold_extra

		//
		// Add Iron ore features.
		// 

		// ore_iron_middle
		event.addOre((ore) => {
			ore.id = "ninetimes:ore_iron_middle" // (optional, but recommended) custom id for the feature

			// ??BUG?? Not sure if tags are working.. only seems to be replacing deepslate, and seems to spawn
			// much more ore when i directly target a block rather than using deeplate_ore_replaceables
			// FIX: First of all I needed to restart the whole game for the script to reload (sometimes)
			// Second of all TAGS ARE NOT WORKING, tried with a # and without a # in front, must be some undocumented
			// change in KubeJS
			// See BlockTags.java for the block tags...
			ore.addTarget("minecraft:stone", "minecraft:iron_ore") 
			ore.addTarget("minecraft:deepslate", "minecraft:deepslate_iron_ore") 

			ore.count((10 * numVeinsMult) * percentFound)  // generate between 15 and 50 veins (chosen at random), you could use a single number here for a fixed amount of blocks
					.squared() // I thought this was the same as "uniform" but no, it randomizes the placement of the ore veins slightly, without this the ores boundries are very obvious. this is the same as InSquarePlacementModifier that OrePlacedFeatures.java uses when instantiating the Holder<PlacedFeature>"s, which calls PlacedFeatureUtil.register(ID, (optional InSquarePlacementModifier.instance()), OreConfiguredFeatures, (A placement modifier like HeightRangePlacementModifier), (optional biome placement modifier)) just look at the source...       // randomly spreads the ores out across the chunk, instead of generating them in a column
					.triangleHeight(// The mappings for minecraft call this "trapezoid" but KubeJS calls it triangle, the other option is uniform, which is the same as the mappings call it.
							anchors.absolute(-24), // the lower bound should be 32 blocks above the bottom of the world, so in this case, Y = -32 since minY = -64
							anchors.absolute(56)	 // the upper bound, meanwhile is set to be just exactly at Y = 96
					)								 // in total, the ore can be found between Y levels -32 and 96, and will be most likely at Y = (96 + -32) / 2 = 32
			
			// more, optional parameters (default values are shown here)
			ore.size = 9 * veinSizeMult                            // max. vein size
			ore.noSurface = 0.70                     // chance to discard if the ore would be exposed to air
			ore.worldgenLayer = "underground_ores"  // what generation step the ores should be generated in (see below)
			ore.chance = 0							// if != 0 and count is unset, the ore has a 1/n chance to generate per chunk
		})

		// ore_iron_upper
		event.addOre((ore) => {
			ore.id = "ninetimes:ore_iron_upper"
			ore.addTarget("minecraft:stone", "minecraft:iron_ore") 
			ore.addTarget("minecraft:deepslate", "minecraft:deepslate_iron_ore") 
			ore.count((90 * numVeinsMult) * percentFound)  
					.squared() 
					.triangleHeight(// The mappings for minecraft call this "trapezoid" but KubeJS calls it triangle, the other option is uniform, which is the same as the mappings call it.
							anchors.absolute(80), // the lower bound should be 32 blocks above the bottom of the world, so in this case, Y = -32 since minY = -64
							anchors.absolute(384)	 // the upper bound, meanwhile is set to be just exactly at Y = 96
					)								 // in total, the ore can be found between Y levels -32 and 96, and will be most likely at Y = (96 + -32) / 2 = 32
			
			// more, optional parameters (default values are shown here)
			ore.size = 9 * veinSizeMult                            // max. vein size
			ore.noSurface = 0.8                     // chance to discard if the ore would be exposed to air
			ore.worldgenLayer = "underground_ores"  // what generation step the ores should be generated in (see below)
			ore.chance = 0							// if != 0 and count is unset, the ore has a 1/n chance to generate per chunk
		})

		// ore_iron_small
		event.addOre((ore) => {
			ore.id = "ninetimes:ore_iron_small"
			ore.addTarget("minecraft:stone", "minecraft:iron_ore") 
			ore.addTarget("minecraft:deepslate", "minecraft:deepslate_iron_ore") 
			ore.count((10 * numVeinsMult) * percentFound)  
					.squared() 
					.triangleHeight(// The mappings for minecraft call this "trapezoid" but KubeJS calls it triangle, the other option is uniform, which is the same as the mappings call it.
							anchors.absolute(-64), // the lower bound should be 32 blocks above the bottom of the world, so in this case, Y = -32 since minY = -64
							anchors.absolute(72)	 // the upper bound, meanwhile is set to be just exactly at Y = 96
					)								 // in total, the ore can be found between Y levels -32 and 96, and will be most likely at Y = (96 + -32) / 2 = 32
			
			// more, optional parameters (default values are shown here)
			ore.size = 4 * veinSizeMult                            // max. vein size
			ore.noSurface = 0.25                    // chance to discard if the ore would be exposed to air
			ore.worldgenLayer = "underground_ores"  // what generation step the ores should be generated in (see below)
			ore.chance = 0							// if != 0 and count is unset, the ore has a 1/n chance to generate per chunk
		})

		//
		// Add dense Iron ore features.
		// 
		


		// dense_ore_iron_middle
		event.addOre((ore) => {
			ore.id = "ninetimes:dense_ore_iron_middle" // (optional, but recommended) custom id for the feature

			ore.addTarget("minecraft:iron_ore", "denseores:dense_iron_ore") 
			ore.addTarget("minecraft:deepslate_iron_ore", "denseores:dense_deepslate_iron_ore") 

			ore.count((10 * numVeinsMult) * percentFound)
					.squared()
					.triangleHeight(
							anchors.absolute(-24), 
							anchors.absolute(56)	
					)
			
			ore.size = 9 * veinSizeMult * commonDenseOreVeinSizeMult     
			ore.noSurface = 1.0                     
			ore.worldgenLayer = "underground_decoration" // Dense ores after normal ore generation
			ore.chance = 0
		})

		// dense_ore_iron_upper
		event.addOre((ore) => {
			ore.id = "ninetimes:dense_ore_iron_upper"
			ore.addTarget("minecraft:iron_ore", "denseores:dense_iron_ore") 
			ore.addTarget("minecraft:deepslate_iron_ore", "denseores:dense_deepslate_iron_ore") 
			ore.count((90 * numVeinsMult) * percentFound)  
					.squared() 
					.triangleHeight(
							anchors.absolute(80), 
							anchors.absolute(384)
					)								 
			
			
			ore.size = 9 * veinSizeMult * commonDenseOreVeinSizeMult                          
			ore.noSurface = 1.0                     
			ore.worldgenLayer = "underground_decoration"  // Dense ores after normal ore generation
			ore.chance = 0	
		})

		//
		// Add diamond ore features.
		//

		// ore_diamond
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:ore_diamond"
					ore.biomes = "#minecraft:is_overworld"

					// OreConfiguredFeatures.DIAMOND_ORE_TARGETS
					ore.addTarget("minecraft:stone", "minecraft:diamond_ore") 
					ore.addTarget("minecraft:deepslate", "minecraft:deepslate_diamond_ore")
					
					// OrePlacedFeatures.ORE_DIAMOND
					ore.count((7 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.aboveBottom(-80),
							anchors.aboveBottom(80)
						)
					ore.chance = 0

					// OreConfiguredFeatures.ORE_DIAMOND_SMALL
					ore.size = 4 * veinSizeMult
					ore.noSurface = 0.5
					ore.worldgenLayer = "underground_ores" 
				}
		)

		// ore_diamond_large
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:ore_diamond_large"
					ore.biomes = "#minecraft:is_overworld"

					// OreConfiguredFeatures.DIAMOND_ORE_TARGETS
					ore.addTarget("minecraft:stone", "minecraft:diamond_ore") 
					ore.addTarget("minecraft:deepslate", "minecraft:deepslate_diamond_ore")
					
					// OrePlacedFeatures.ORE_DIAMOND_LARGE
					ore.chance = (9 * numVeinsMult) * percentFound
					ore .squared() 
						.triangleHeight
						(
							anchors.aboveBottom(-80),
							anchors.aboveBottom(80)
						)
						
					// OreConfiguredFeatures.ORE_DIAMOND_LARGE
					ore.size = 4 * veinSizeMult
					ore.noSurface = 0.5
					ore.worldgenLayer = "underground_ores" 
				}
		)

		// ore_diamond_buried
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:ore_diamond_buried"
					ore.biomes = "#minecraft:is_overworld"

					// OreConfiguredFeatures.DIAMOND_ORE_TARGETS
					ore.addTarget("minecraft:stone", "minecraft:diamond_ore") 
					ore.addTarget("minecraft:deepslate", "minecraft:deepslate_diamond_ore")
					
					// OrePlacedFeatures.ORE_DIAMOND_BURIED
					ore.count((4 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.aboveBottom(-80),
							anchors.aboveBottom(80)
						)
					ore.chance = 0
						
					// OreConfiguredFeatures.ORE_DIAMOND_BURIED
					ore.size = 8 * veinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_ores" 
				}
		)

		//
		// Add dense diamond ore features.
		//

		// dense_ore_diamond
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:dense_ore_diamond"
					ore.biomes = "#minecraft:is_overworld"

					// OreConfiguredFeatures.DIAMOND_ORE_TARGETS
					ore.addTarget("minecraft:diamond_ore", "denseores:dense_diamond_ore") 
					ore.addTarget("minecraft:deepslate_diamond_ore", "denseores:dense_deepslate_diamond_ore")
					
					// OrePlacedFeatures.ORE_DIAMOND
					ore.count((7 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.aboveBottom(-80),
							anchors.aboveBottom(80)
						)
					ore.chance = 0

					// OreConfiguredFeatures.ORE_DIAMOND_SMALL
					ore.size = 4 * veinSizeMult * rareDenseOreVeinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_decoration" 
				}
		)

		// dense_ore_diamond_large
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:dense_ore_diamond_large"
					ore.biomes = "#minecraft:is_overworld"

					// OreConfiguredFeatures.DIAMOND_ORE_TARGETS
					ore.addTarget("minecraft:diamond_ore", "denseores:dense_diamond_ore") 
					ore.addTarget("minecraft:deepslate_diamond_ore", "denseores:dense_deepslate_diamond_ore")
					
					// OrePlacedFeatures.ORE_DIAMOND_LARGE
					ore.chance = (9 * numVeinsMult) * percentFound
					ore .squared() 
						.triangleHeight
						(
							anchors.aboveBottom(-80),
							anchors.aboveBottom(80)
						)
						
					// OreConfiguredFeatures.ORE_DIAMOND_LARGE
					ore.size = 4 * veinSizeMult * rareDenseOreVeinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_decoration" 
				}
		)

		// dense_ore_diamond_buried
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:dense_ore_diamond_buried"
					ore.biomes = "#minecraft:is_overworld"

					// OreConfiguredFeatures.DIAMOND_ORE_TARGETS
					ore.addTarget("minecraft:diamond_ore", "denseores:dense_diamond_ore") 
					ore.addTarget("minecraft:deepslate_diamond_ore", "denseores:dense_deepslate_diamond_ore")
					
					// OrePlacedFeatures.ORE_DIAMOND_BURIED
					ore.count((4 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.aboveBottom(-80),
							anchors.aboveBottom(80)
						)
					ore.chance = 0
						
					// OreConfiguredFeatures.ORE_DIAMOND_BURIED
					ore.size = 8 * veinSizeMult * rareDenseOreVeinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_decoration" 
				}
		)

		//
		// Add emerald ore features.
		//

		// ore_emerald
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:ore_emerald"
					// These tags arent exactly which biomes spawn emeralds but its close enough
					ore.biomes = 
					[
						"#minecraft:is_mountain",
						"#minecraft:is_hill"
					]

					// OreConfiguredFeatures.ORE_EMERALD
					ore.addTarget("minecraft:stone", "minecraft:emerald_ore") 
					ore.addTarget("minecraft:deepslate", "minecraft:deepslate_emerald_ore")
					
					// OrePlacedFeatures.ORE_EMERALD
					ore.count((100 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.absolute(-16),
							anchors.absolute(480)
						)
					ore.chance = 0

					// OreConfiguredFeatures.ORE_EMERALD
					ore.size = 3 * veinSizeMult
					ore.noSurface = 0.0
					ore.worldgenLayer = "underground_ores" 
				}
		)

		//
		// Add dense emerald ore features.
		//

		// dense_ore_emerald
		event.addOre
		(
			ore => 
				{
					ore.id = "ninetimes:dense_ore_emerald"
					// These tags arent exactly which biomes spawn emeralds but its close enough
					ore.biomes = 
					[
						"#minecraft:is_mountain",
						"#minecraft:is_hill"
					]

					// OreConfiguredFeatures.ORE_EMERALD
					ore.addTarget("minecraft:emerald_ore", "denseores:dense_emerald_ore") 
					ore.addTarget("minecraft:deepslate_emerald_ore", "denseores:dense_deepslate_emerald_ore")
					
					// OrePlacedFeatures.ORE_EMERALD
					ore.count((100 * numVeinsMult) * percentFound)  
						.squared() 
						.triangleHeight
						(
							anchors.absolute(-16),
							anchors.absolute(480)
						)
					ore.chance = 0

					// OreConfiguredFeatures.ORE_EMERALD
					ore.size = 3 * veinSizeMult * rareDenseOreVeinSizeMult
					ore.noSurface = 1.0
					ore.worldgenLayer = "underground_decoration" 
				}
		)


	}
)


/**
OreGeneratedFeatures.java:18:

	public static final List<OreFeatureConfig.Target> IRON_ORE_TAGETS = List.of(
	OreFeatureConfig.createTarget(STONE_ORE_REPLACEABLES, Blocks.IRON_ORE.getDefaultState()),
	OreFeatureConfig.createTarget(DEEPSLATE_ORE_REPLACEABLES, Blocks.DEEPSLATE_IRON_ORE.getDefaultState())
	);

OreGeneratedFeatures.java:84:

	public static final Holder<ConfiguredFeature<OreFeatureConfig, ?>> ORE_IRON = ConfiguredFeatureUtil.register(
	"ore_iron", Feature.ORE, new OreFeatureConfig(IRON_ORE_TAGETS, 9)
	);
	public static final Holder<ConfiguredFeature<OreFeatureConfig, ?>> ORE_IRON_SMALL = ConfiguredFeatureUtil.register(
		"ore_iron_small", Feature.ORE, new OreFeatureConfig(IRON_ORE_TAGETS, 4)
	);

OrePlacedFeatures.java:98:

	public static final Holder<PlacedFeature> ORE_IRON_UPPER = PlacedFeatureUtil.register(
	"ore_iron_upper",
	OreConfiguredFeatures.ORE_IRON,
	commonOrePlacementModifiers(90, HeightRangePlacementModifier.trapezoid(YOffset.fixed(80), YOffset.fixed(384)))
	);
	public static final Holder<PlacedFeature> ORE_IRON_MIDDLE = PlacedFeatureUtil.register(
	"ore_iron_middle",
	OreConfiguredFeatures.ORE_IRON,
	commonOrePlacementModifiers(10, HeightRangePlacementModifier.trapezoid(YOffset.fixed(-24), YOffset.fixed(56)))
	);
	public static final Holder<PlacedFeature> ORE_IRON_SMALL = PlacedFeatureUtil.register(
		"ore_iron_small",
		OreConfiguredFeatures.ORE_IRON_SMALL,
		commonOrePlacementModifiers(10, HeightRangePlacementModifier.createUniform(YOffset.getBottom(), YOffset.fixed(72)))
	);
 */

/**
	I was trying to figure out how/where the extra copper for the dripstone caves biome gets added and I finally found it, another piece to the worldgen puzzle

	OverworldBiomeCreator.java:783
	public static Biome createDripstoneCaves() {
		SpawnSettings.Builder builder = new SpawnSettings.Builder();
		DefaultBiomeFeatures.addDristoneCaveMobs(builder);
		GenerationSettings.Builder builder2 = new GenerationSettings.Builder();
		addBasicFeatures(builder2);
		DefaultBiomeFeatures.addPlainsTallGrass(builder2);
		DefaultBiomeFeatures.addDefaultOres(builder2, true);
		DefaultBiomeFeatures.addDefaultDisks(builder2);
		DefaultBiomeFeatures.addPlainsFeatures(builder2);
		DefaultBiomeFeatures.addDefaultMushrooms(builder2);
		DefaultBiomeFeatures.addDefaultVegetation(builder2);
		DefaultBiomeFeatures.addDripstone(builder2);
		MusicSound musicSound = MusicType.createIngameMusic(SoundEvents.MUSIC_OVERWORLD_DRIPSTONE_CAVES);
		return m_jwilswlx(Biome.Precipitation.RAIN, 0.8F, 0.4F, builder, builder2, musicSound);
	}

	The XBiomeCreator classes call the DefaultBiomeFeatures.java functions to add specific world features.
	The addDefaultOre function takes an argument that determines whether or not the "large copper ore blobs" generate, which is set to true for only the createDripstoneCaves() function. 
	
	DefaultBiomeFeatures.addDefaultOres(GenerationSettings.Builder builder, boolean largeCopperOreBlob)  
	the addDefaultOres() function individually adds the features using the builders feature() function
	GenerationSettings.Builder feature(GenerationStep.Feature featureStep, Holder<PlacedFeature> feature)

	What I learned:
	I don"t think I would use this design and instead I would have a generic "addFeature(GenerationStep, ArrayList<PlacedFeature>)" in the builder class. 
	addFeature would take the generation step and a list of features which could be a predefined list (instead of addDefaultOres an arraylist of DEFAULT_ORES), or a single feature. 
	so in the case of the dripstone caves you could simply:
	builder.addFeature(GenerationStep.Feature.UNDERGROUND_ORES, OrePlacedFeatures.DEFAULT_ORES)
	builder.addFeature(GenerationStep.Feature.UNDERGROUND_ORES, OrePlacedFeatures.ORE_COPPER_LARGE)
	or something similar.
	This saves you from having to create an entire class dedicated to creating features, when the XBiomeCreator classes already exist. You could then simply directly access the PlacedFeatures from OrePlacedFeatures.java, which could be
	filled with lists like DEFAULT_ORES for convenience.
	I can"t be sure but I think this may have happened because they predicted that they would need to do more in the feature adding step, but it seems that prediction turned out wrong, and all they do in DefaultBiomeFeatures.java (and other similar classes) is call builder.feature(...) a bunch of times. 
	This spreads out the code and you gain nothing for it other than a reduction in comprehensibility, and extra work for yourself in the future.
	Now if I want to add a new feature I have to edit at least one extra file, which could easily turn into many more extra files.
	I believe that when this situation (inevitably, no one can predict perfectly) occurs then as soon as you notice 
	youve made an incorrect assumption you need to go back and minify your code, remove the unnecessary parts to 
	reduce the complexity of your code so that future you doesnt have to get lost browsing through 12 extra files
	that could have been 2.

	The whole system also makes it fairly difficult to add new ores to a biome in post.
 */