ServerEvents.tags
(
    'block',
    event =>
    {   
        // Make giant crops harvestable by computercraft
        event.add('minecraft:mineable/hoe', 'giant_crops:giant_beetroot');
        event.add('minecraft:mineable/hoe', 'giant_crops:giant_carrot');
        event.add('minecraft:mineable/hoe', 'giant_crops:giant_potato');
        event.add('minecraft:mineable/hoe', 'giant_crops:giant_poisonous_potato');
    }
)