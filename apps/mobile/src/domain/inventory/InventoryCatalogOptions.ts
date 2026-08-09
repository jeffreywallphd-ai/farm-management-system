export interface InventoryCatalogCommonOption {
  value: string;
  label: string;
  icon?: string;
}

export interface InventoryCatalogCategory {
  value: string;
  label: string;
  icon?: string;
  options: InventoryCatalogCommonOption[];
}

export const OTHER_INVENTORY_OPTION_VALUE = "other";

export const materialCatalogCategories: InventoryCatalogCategory[] = [
  {
    value: "soilFertility",
    label: "Soil, fertility, and amendments",
    icon: "soil",
    options: [
      { value: "compost", label: "Compost", icon: "soil" },
      { value: "agedManure", label: "Aged manure", icon: "soil" },
      { value: "rawManure", label: "Raw manure", icon: "soil" },
      { value: "lime", label: "Lime", icon: "material" },
      { value: "gypsum", label: "Gypsum", icon: "material" },
      { value: "kelpMeal", label: "Kelp meal", icon: "leaf" },
      { value: "boneMeal", label: "Bone meal", icon: "material" },
      { value: "bloodMeal", label: "Blood meal", icon: "material" },
      { value: "fishEmulsion", label: "Fish emulsion", icon: "material" },
      { value: "granularFertilizer", label: "Granular fertilizer", icon: "material" },
    ],
  },
  {
    value: "seedsPlantingStock",
    label: "Seeds and planting stock",
    icon: "seed",
    options: [
      { value: "vegetableSeed", label: "Vegetable seed", icon: "seed" },
      { value: "herbSeed", label: "Herb seed", icon: "seed" },
      { value: "coverCropSeed", label: "Cover crop seed", icon: "seed" },
      { value: "seedPotatoes", label: "Seed potatoes", icon: "seed" },
      { value: "garlicSeed", label: "Garlic seed", icon: "seed" },
      { value: "onionSets", label: "Onion sets", icon: "seed" },
      { value: "transplants", label: "Transplants", icon: "sprout" },
      { value: "legumeInoculant", label: "Legume inoculant", icon: "material" },
    ],
  },
  {
    value: "propagationContainers",
    label: "Propagation, pots, and trays",
    icon: "sprout",
    options: [
      { value: "seedStartingMix", label: "Seed-starting mix", icon: "soil" },
      { value: "pottingMix", label: "Potting mix", icon: "soil" },
      { value: "plugTrays", label: "Plug trays", icon: "grid" },
      { value: "seedTrays", label: "Seed trays", icon: "grid" },
      { value: "nurseryPots", label: "Nursery pots", icon: "package" },
      { value: "soilBlocks", label: "Soil blocks", icon: "soil" },
      { value: "plantLabels", label: "Plant labels", icon: "package" },
      { value: "germinationDomes", label: "Germination domes", icon: "package" },
      { value: "greenhouseBenchLiner", label: "Greenhouse bench liner", icon: "package" },
    ],
  },
  {
    value: "mulchCovers",
    label: "Mulch, covers, and bed materials",
    icon: "leaf",
    options: [
      { value: "strawMulch", label: "Straw mulch", icon: "leaf" },
      { value: "hayMulch", label: "Hay mulch", icon: "leaf" },
      { value: "woodChips", label: "Wood chips", icon: "leaf" },
      { value: "plasticMulch", label: "Plastic mulch", icon: "package" },
      { value: "paperMulch", label: "Paper mulch", icon: "package" },
      { value: "landscapeFabric", label: "Landscape fabric", icon: "package" },
      { value: "silageTarp", label: "Silage tarp", icon: "package" },
      { value: "rowCover", label: "Row cover", icon: "leaf" },
      { value: "insectNetting", label: "Insect netting", icon: "bug" },
      { value: "shadeCloth", label: "Shade cloth", icon: "leaf" },
    ],
  },
  {
    value: "irrigationWater",
    label: "Irrigation and water",
    icon: "material",
    options: [
      { value: "dripTape", label: "Drip tape", icon: "material" },
      { value: "dripTubing", label: "Drip tubing", icon: "material" },
      { value: "dripFittings", label: "Drip fittings", icon: "material" },
      { value: "emitters", label: "Emitters", icon: "material" },
      { value: "irrigationFilter", label: "Irrigation filter", icon: "material" },
      { value: "pressureRegulator", label: "Pressure regulator", icon: "material" },
      { value: "hose", label: "Hose", icon: "material" },
      { value: "sprinkler", label: "Sprinkler", icon: "material" },
      { value: "waterTank", label: "Water tank", icon: "material" },
    ],
  },
  {
    value: "pestDiseaseWeed",
    label: "Pest, disease, and weed inputs",
    icon: "bug",
    options: [
      { value: "stickyTraps", label: "Sticky traps", icon: "bug" },
      { value: "pheromoneTraps", label: "Pheromone traps", icon: "bug" },
      { value: "bt", label: "Bt", icon: "bug" },
      { value: "neemOil", label: "Neem oil", icon: "bug" },
      { value: "insecticidalSoap", label: "Insecticidal soap", icon: "bug" },
      { value: "horticulturalOil", label: "Horticultural oil", icon: "bug" },
      { value: "copperFungicide", label: "Copper fungicide", icon: "bug" },
      { value: "sulfur", label: "Sulfur", icon: "bug" },
      { value: "biofungicide", label: "Biofungicide", icon: "bug" },
      { value: "slugBait", label: "Slug bait", icon: "bug" },
    ],
  },
  {
    value: "harvestPackaging",
    label: "Harvest and packaging supplies",
    icon: "package",
    options: [
      { value: "harvestBins", label: "Harvest bins", icon: "harvest" },
      { value: "produceBoxes", label: "Produce boxes", icon: "package" },
      { value: "produceBags", label: "Produce bags", icon: "package" },
      { value: "clamshellContainers", label: "Clamshell containers", icon: "package" },
      { value: "packingContainers", label: "Packing containers", icon: "package" },
      { value: "rubberBands", label: "Rubber bands", icon: "package" },
      { value: "twistTies", label: "Twist ties", icon: "package" },
      { value: "labels", label: "Labels", icon: "package" },
      { value: "waxBoxes", label: "Wax boxes", icon: "package" },
      { value: "marketBags", label: "Market bags", icon: "package" },
    ],
  },
  {
    value: "washPackSanitation",
    label: "Wash-pack and sanitation",
    icon: "package",
    options: [
      { value: "washSanitizer", label: "Wash sanitizer", icon: "material" },
      { value: "foodGradeCleaner", label: "Food-grade cleaner", icon: "material" },
      { value: "sanitizerTestStrips", label: "Sanitizer test strips", icon: "material" },
      { value: "handSoap", label: "Hand soap", icon: "material" },
      { value: "paperTowels", label: "Paper towels", icon: "package" },
      { value: "disposableGloves", label: "Disposable gloves", icon: "package" },
      { value: "sprayBottles", label: "Spray bottles", icon: "material" },
      { value: "scrubBrushes", label: "Scrub brushes", icon: "material" },
      { value: "coolerThermometer", label: "Cooler thermometer", icon: "material" },
    ],
  },
  {
    value: "compostBedding",
    label: "Compost materials and bedding",
    icon: "soil",
    options: [
      { value: "carbonBedding", label: "Carbon bedding", icon: "soil" },
      { value: "woodShavings", label: "Wood shavings", icon: "leaf" },
      { value: "strawBedding", label: "Straw bedding", icon: "leaf" },
      { value: "leaves", label: "Leaves", icon: "leaf" },
      { value: "compostInoculant", label: "Compost inoculant", icon: "soil" },
      { value: "compostCover", label: "Compost cover", icon: "package" },
      { value: "compostThermometer", label: "Compost thermometer", icon: "material" },
      { value: "palletBinMaterials", label: "Pallet bin materials", icon: "package" },
    ],
  },
  {
    value: "livestockPoultry",
    label: "Livestock and chicken supplies",
    icon: "material",
    options: [
      { value: "layerFeed", label: "Layer feed", icon: "material" },
      { value: "chickStarter", label: "Chick starter", icon: "material" },
      { value: "broilerFeed", label: "Broiler feed", icon: "material" },
      { value: "grit", label: "Grit", icon: "material" },
      { value: "oysterShell", label: "Oyster shell", icon: "material" },
      { value: "beddingShavings", label: "Bedding shavings", icon: "leaf" },
      { value: "eggCartons", label: "Egg cartons", icon: "package" },
      { value: "coopBedding", label: "Coop bedding", icon: "leaf" },
      { value: "mineralSupplement", label: "Mineral supplement", icon: "material" },
      { value: "livestockFirstAid", label: "Livestock first-aid supply", icon: "material" },
    ],
  },
];

export const equipmentCatalogCategories: InventoryCatalogCategory[] = [
  {
    value: "handTools",
    label: "Hand tools",
    icon: "material",
    options: [
      { value: "hoe", label: "Hoe", icon: "material" },
      { value: "rake", label: "Rake", icon: "material" },
      { value: "shovel", label: "Shovel", icon: "material" },
      { value: "spade", label: "Spade", icon: "material" },
      { value: "broadfork", label: "Broadfork", icon: "soil" },
      { value: "diggingFork", label: "Digging fork", icon: "soil" },
      { value: "wheelHoe", label: "Wheel hoe", icon: "material" },
      { value: "pruners", label: "Pruners", icon: "material" },
      { value: "harvestKnife", label: "Harvest knife", icon: "harvest" },
      { value: "trowel", label: "Trowel", icon: "material" },
    ],
  },
  {
    value: "powerTillage",
    label: "Power, tillage, and bed prep",
    icon: "soil",
    options: [
      { value: "walkBehindTractor", label: "Walk-behind tractor", icon: "soil" },
      { value: "rototiller", label: "Rototiller", icon: "soil" },
      { value: "tractor", label: "Tractor", icon: "soil" },
      { value: "mower", label: "Mower", icon: "soil" },
      { value: "flailMower", label: "Flail mower", icon: "soil" },
      { value: "bedShaper", label: "Bed shaper", icon: "soil" },
      { value: "mulchLayer", label: "Mulch layer", icon: "soil" },
      { value: "seederAttachment", label: "Seeder attachment", icon: "seed" },
      { value: "cultivator", label: "Cultivator", icon: "soil" },
    ],
  },
  {
    value: "seedingPropagation",
    label: "Seeding and propagation equipment",
    icon: "seed",
    options: [
      { value: "seedlingHeatMat", label: "Seedling heat mat", icon: "seed" },
      { value: "growLights", label: "Grow lights", icon: "seed" },
      { value: "seeder", label: "Seeder", icon: "seed" },
      { value: "vacuumSeeder", label: "Vacuum seeder", icon: "seed" },
      { value: "soilBlocker", label: "Soil blocker", icon: "soil" },
      { value: "pottingBench", label: "Potting bench", icon: "sprout" },
      { value: "germinationRack", label: "Germination rack", icon: "sprout" },
      { value: "greenhouseCart", label: "Greenhouse cart", icon: "sprout" },
      { value: "trayDibbler", label: "Tray dibbler", icon: "seed" },
    ],
  },
  {
    value: "irrigationEquipment",
    label: "Irrigation equipment",
    icon: "material",
    options: [
      { value: "irrigationPump", label: "Irrigation pump", icon: "material" },
      { value: "waterTank", label: "Water tank", icon: "material" },
      { value: "filterAssembly", label: "Filter assembly", icon: "material" },
      { value: "pressureRegulator", label: "Pressure regulator", icon: "material" },
      { value: "timerController", label: "Timer/controller", icon: "clock" },
      { value: "headerManifold", label: "Header manifold", icon: "material" },
      { value: "hoseReel", label: "Hose reel", icon: "material" },
      { value: "sprayer", label: "Sprayer", icon: "material" },
      { value: "fertigationInjector", label: "Fertigation injector", icon: "material" },
    ],
  },
  {
    value: "seasonExtension",
    label: "Greenhouse and season extension",
    icon: "sprout",
    options: [
      { value: "greenhouse", label: "Greenhouse", icon: "sprout" },
      { value: "highTunnel", label: "High tunnel", icon: "sprout" },
      { value: "lowTunnelHoops", label: "Low tunnel hoops", icon: "sprout" },
      { value: "rowCoverHoops", label: "Row cover hoops", icon: "sprout" },
      { value: "shadeClothFrame", label: "Shade cloth frame", icon: "sprout" },
      { value: "ventOpener", label: "Vent opener", icon: "sprout" },
      { value: "greenhouseFan", label: "Greenhouse fan", icon: "sprout" },
      { value: "heater", label: "Heater", icon: "sprout" },
      { value: "thermostat", label: "Thermostat", icon: "clock" },
    ],
  },
  {
    value: "harvestWashPack",
    label: "Harvest and wash-pack equipment",
    icon: "harvest",
    options: [
      { value: "harvestCart", label: "Harvest cart", icon: "harvest" },
      { value: "washTable", label: "Wash table", icon: "package" },
      { value: "dunkTank", label: "Dunk tank", icon: "package" },
      { value: "sprayTable", label: "Spray table", icon: "package" },
      { value: "greensSpinner", label: "Greens spinner", icon: "harvest" },
      { value: "dryingRack", label: "Drying rack", icon: "package" },
      { value: "packingTable", label: "Packing table", icon: "package" },
      { value: "scale", label: "Scale", icon: "material" },
      { value: "cooler", label: "Cooler", icon: "package" },
      { value: "labelPrinter", label: "Label printer", icon: "package" },
    ],
  },
  {
    value: "storageTransport",
    label: "Storage and transport",
    icon: "package",
    options: [
      { value: "handTruck", label: "Hand truck", icon: "package" },
      { value: "dolly", label: "Dolly", icon: "package" },
      { value: "palletJack", label: "Pallet jack", icon: "package" },
      { value: "shelving", label: "Shelving", icon: "package" },
      { value: "storageBins", label: "Storage bins", icon: "package" },
      { value: "truck", label: "Truck", icon: "package" },
      { value: "trailer", label: "Trailer", icon: "package" },
      { value: "utilityCart", label: "Utility cart", icon: "package" },
      { value: "coolerShelving", label: "Cooler shelving", icon: "package" },
    ],
  },
  {
    value: "livestockPoultryEquipment",
    label: "Livestock and poultry equipment",
    icon: "material",
    options: [
      { value: "feeder", label: "Feeder", icon: "material" },
      { value: "waterer", label: "Waterer", icon: "material" },
      { value: "brooder", label: "Brooder", icon: "material" },
      { value: "heatLamp", label: "Heat lamp", icon: "material" },
      { value: "coop", label: "Coop", icon: "place" },
      { value: "nestBox", label: "Nest box", icon: "package" },
      { value: "fencing", label: "Fencing", icon: "place" },
      { value: "electricNetting", label: "Electric netting", icon: "place" },
      { value: "eggScale", label: "Egg scale", icon: "material" },
      { value: "crate", label: "Crate", icon: "package" },
    ],
  },
  {
    value: "maintenanceSafety",
    label: "Maintenance and safety",
    icon: "setup",
    options: [
      { value: "toolSharpener", label: "Tool sharpener", icon: "setup" },
      { value: "batteryCharger", label: "Battery charger", icon: "setup" },
      { value: "fuelCan", label: "Fuel can", icon: "setup" },
      { value: "greaseGun", label: "Grease gun", icon: "setup" },
      { value: "firstAidKit", label: "First-aid kit", icon: "setup" },
      { value: "fireExtinguisher", label: "Fire extinguisher", icon: "setup" },
      { value: "ppeKit", label: "PPE kit", icon: "setup" },
      { value: "shopVacuum", label: "Shop vacuum", icon: "setup" },
      { value: "airCompressor", label: "Air compressor", icon: "setup" },
    ],
  },
];

export function categoryLabelFor(categories: InventoryCatalogCategory[], value: string | undefined): string | undefined {
  return categories.find((category) => category.value === value)?.label;
}

export function commonOptionLabelFor(
  categories: InventoryCatalogCategory[],
  categoryValue: string | undefined,
  commonItemKey: string | undefined,
): string | undefined {
  if (!categoryValue || !commonItemKey || commonItemKey === OTHER_INVENTORY_OPTION_VALUE) {
    return undefined;
  }

  return categories.find((category) => category.value === categoryValue)?.options.find((option) => option.value === commonItemKey)?.label;
}
