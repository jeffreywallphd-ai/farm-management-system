import type { Clock } from "../../ports/Clock";
import type { IdGenerator } from "../../ports/IdGenerator";
import type { PlanningRepository } from "../../ports/PlanningRepository";
import type { FarmId } from "../../../domain/farm/Farm";
import type {
  PlanningGoal,
  PlanningGoalCategory,
  PlanningFarmWorkPackItemState,
  PlanningFarmWorkPackState,
  PlanningTask,
  PlanningTaskPriority,
} from "../../../domain/planning/Planning";
import { savePlanningGoal, savePlanningTask } from "./ManagePlanning";

export type FarmWorkPackId =
  | "marketGardenPlanning"
  | "marketGardenWork"
  | "greenhouseSeedlingPlanning"
  | "greenhouseSeedlingWork"
  | "compostPlanning"
  | "compostWork"
  | "chickenCarePlanning"
  | "chickenCareWork"
  | "irrigationPlanning"
  | "irrigationWork"
  | "harvestWashPackPlanning"
  | "harvestWashPackWork"
  | "materialOrderingPlanning"
  | "materialOrderingWork"
  | "equipmentMaintenancePlanning"
  | "equipmentMaintenanceWork";

export type FarmWorkPackGroup = "administrationPlanning" | "farmWork";

export interface FarmWorkPackTaskTemplate {
  key: string;
  title: string;
  notes: string;
  priority?: PlanningTaskPriority;
  estimatedMinutes?: number;
}

export interface FarmWorkPackSubgoalTemplate {
  key: string;
  title: string;
  description: string;
  tasks: FarmWorkPackTaskTemplate[];
}

export interface FarmWorkPackGoalTemplate {
  key: string;
  title: string;
  description: string;
  category: PlanningGoalCategory;
  subgoals: FarmWorkPackSubgoalTemplate[];
}

export interface FarmWorkPack {
  id: FarmWorkPackId;
  group: FarmWorkPackGroup;
  title: string;
  shortTitle: string;
  setupQuestion: string;
  description: string;
  suggestedFor: string[];
  goals: FarmWorkPackGoalTemplate[];
}

export interface FarmWorkPackTaskSetupSummary extends FarmWorkPackTaskTemplate {
  templateKey: string;
  isApplied: boolean;
  isActive: boolean;
}

export interface FarmWorkPackSubgoalSetupSummary {
  key: string;
  title: string;
  description: string;
  templateKey: string;
  isApplied: boolean;
  isActive: boolean;
  tasks: FarmWorkPackTaskSetupSummary[];
}

export interface FarmWorkPackGoalSetupSummary {
  key: string;
  title: string;
  description: string;
  templateKey: string;
  isApplied: boolean;
  isActive: boolean;
  subgoals: FarmWorkPackSubgoalSetupSummary[];
}

export interface FarmWorkPackSetupSummary {
  id: FarmWorkPackId;
  group: FarmWorkPackGroup;
  title: string;
  shortTitle: string;
  setupQuestion: string;
  description: string;
  suggestedFor: string[];
  goalCount: number;
  taskCount: number;
  isApplied: boolean;
  isActive: boolean;
  goals: FarmWorkPackGoalSetupSummary[];
}

export const FARM_WORK_PACKS: FarmWorkPack[] = [
  {
    id: "marketGardenPlanning",
    group: "administrationPlanning",
    title: "Market garden administration and planning",
    shortTitle: "Market garden admin",
    setupQuestion: "Do you plan crop lists, bed space, seed needs, or planting schedules for market crops?",
    description: "Adds crop-list, bed-space, seed-order, planting-calendar, succession, and season-review planning tasks.",
    suggestedFor: ["crop planning", "vegetable beds", "CSA", "farmers market", "cut flowers"],
    goals: [
      {
        key: "market-garden-planning",
        title: "Plan market garden crop work",
        description: "Turn crop intentions into usable bed, seed, planting, and review plans.",
        category: "cropProduction",
        subgoals: [
          {
            key: "crop-season-planning",
            title: "Plan market garden crops",
            description: "Decide what to grow and translate the crop list into seeds, beds, and planting dates.",
            tasks: [
              task("build-crop-list", "Build crop list for the season", "Expected work: list the crops and varieties this farm intends to grow this season.", "high"),
              task("estimate-bed-feet", "Estimate bed or row feet by crop", "Expected work: estimate field space needed by crop so planting plans match available beds."),
              task("estimate-seed-needs", "Estimate seed and transplant needs", "Expected work: calculate seed, tray, and transplant counts before ordering or sowing.", "high"),
              task("create-seeding-calendar", "Create seeding calendar", "Expected work: write direct-seeding and greenhouse seeding windows for the crop list."),
              task("create-transplant-calendar", "Create transplant calendar", "Expected work: write target transplant dates for crops started in trays."),
              task("schedule-successions", "Create succession planting schedule", "Expected work: identify repeat plantings for crops that need staggered harvest windows."),
            ],
          },
          {
            key: "crop-season-review",
            title: "Review market garden season",
            description: "Capture planning changes while the season is still fresh.",
            tasks: [
              task("record-season-crop-notes", "Record crop notes for next season", "Expected work: write what worked, what failed, and changes to make in next year's plan."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "marketGardenWork",
    group: "farmWork",
    title: "Market garden field work",
    shortTitle: "Market garden work",
    setupQuestion: "Do you want hands-on bed prep, planting, weeding, and crop scouting tasks?",
    description: "Adds field assignment, bed prep, direct seeding, transplanting, thinning, weeding, and crop-readiness tasks.",
    suggestedFor: ["vegetable beds", "field planting", "crop care", "cut flowers", "hand-scale production"],
    goals: [
      {
        key: "market-garden-work",
        title: "Do market garden crop work",
        description: "Prepare beds, plant crops, and keep crop work visible through the season.",
        category: "cropProduction",
        subgoals: [
          {
            key: "crop-field-work",
            title: "Do crop field work",
            description: "Prepare beds, plant crops, and tend priority crop work.",
            tasks: [
              task("assign-crops-to-beds", "Assign crops to fields or beds", "Expected work: choose the farm places where each crop or succession will be planted.", "high"),
              task("prepare-beds", "Prepare beds for planting", "Expected work: clear residues, shape beds, amend as planned, and make a seedbed suitable for the crop."),
              task("direct-seed-crops", "Direct seed scheduled crops", "Expected work: seed crop rows or beds and record the place and date in a farm note if useful."),
              task("transplant-crops", "Transplant scheduled crops", "Expected work: transplant crop starts into the assigned place and note any losses or weather stress."),
              task("thin-direct-seeded-crops", "Thin direct-seeded crops", "Expected work: thin crowded crops to the intended spacing."),
              task("weed-priority-beds", "Weed priority beds", "Expected work: weed the beds where crop competition or harvest quality is most at risk."),
              task("scout-crop-readiness", "Scout crops for harvest readiness", "Expected work: check crops for harvest stage, stress, pests, disease, or quality concerns."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "greenhouseSeedlingPlanning",
    group: "administrationPlanning",
    title: "Greenhouse seedling administration and planning",
    shortTitle: "Greenhouse admin",
    setupQuestion: "Do you plan greenhouse sowing, trays, labels, supplies, or transplant timing?",
    description: "Adds greenhouse sowing-list, supply, tray, label, and hardening-off planning tasks.",
    suggestedFor: ["greenhouse plans", "transplant schedules", "seedling trays", "nursery supplies"],
    goals: [
      {
        key: "greenhouse-seedling-planning",
        title: "Plan greenhouse seedling work",
        description: "Prepare greenhouse records, supplies, and schedules before seedling work starts.",
        category: "cropProduction",
        subgoals: [
          {
            key: "greenhouse-production-planning",
            title: "Plan seedling production",
            description: "Translate planting plans into greenhouse tray and timing needs.",
            tasks: [
              task("build-greenhouse-sowing-list", "Build greenhouse sowing list", "Expected work: list crops, varieties, sowing windows, tray size, and target transplant date.", "high"),
              task("inventory-greenhouse-supplies", "Inventory greenhouse supplies", "Expected work: check seeds, trays, labels, soil mix, domes, watering tools, and germination supplies.", "high"),
              task("set-tray-label-plan", "Set tray and label plan", "Expected work: decide tray counts and label format before filling trays."),
              task("schedule-hardening-off", "Schedule hardening-off windows", "Expected work: write hardening-off dates for transplant groups before field planting."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "greenhouseSeedlingWork",
    group: "farmWork",
    title: "Greenhouse seedling work",
    shortTitle: "Greenhouse work",
    setupQuestion: "Do you want tray prep, sowing, seedling care, and transplant staging tasks?",
    description: "Adds tray sanitation, filling, sowing, labeling, watering, temperature, fertility, culling, hardening-off, and staging tasks.",
    suggestedFor: ["greenhouse", "nursery benches", "transplants", "seedling trays"],
    goals: [
      {
        key: "greenhouse-seedling-work",
        title: "Do greenhouse seedling work",
        description: "Start, care for, and stage seedlings so transplants are ready for field planting.",
        category: "cropProduction",
        subgoals: [
          {
            key: "greenhouse-setup",
            title: "Prepare seedling trays and spaces",
            description: "Prepare spaces, trays, labels, and sowing materials before seedling care begins.",
            tasks: [
              task("sanitize-trays-benches", "Sanitize trays and benches", "Expected work: clean and sanitize reusable trays, benches, and tools before sowing."),
              task("fill-seedling-trays", "Fill trays with seed-starting mix", "Expected work: fill and level trays with the chosen mix before sowing."),
              task("sow-crop-trays", "Sow crop trays", "Expected work: seed trays according to crop needs and the seeding calendar.", "high"),
              task("label-seedling-trays", "Label trays with crop, variety, and date", "Expected work: label each tray so seedlings remain traceable through transplanting.", "high"),
            ],
          },
          {
            key: "seedling-care",
            title: "Care for seedlings",
            description: "Keep seedlings watered, healthy, correctly timed, and ready for transplanting.",
            tasks: [
              task("check-germination", "Check germination daily", "Expected work: check germination, remove failed trays from heat when needed, and note germination problems."),
              task("water-seedlings", "Water seedlings", "Expected work: water seedlings without leaving trays too dry or saturated.", "high"),
              task("monitor-greenhouse-temperature", "Monitor greenhouse temperature", "Expected work: check temperature and note overheating, cold stress, or ventilation needs."),
              task("fertilize-seedlings", "Fertilize seedlings when scheduled", "Expected work: apply seedling fertility according to the farm's plan and crop stage."),
              task("pot-up-seedlings", "Pot up seedlings that outgrow trays", "Expected work: move crowded or oversized seedlings into larger cells or pots."),
              task("cull-weak-seedlings", "Cull weak or diseased seedlings", "Expected work: remove weak, diseased, or unusable seedlings to protect crop quality."),
              task("harden-off-transplants", "Harden off transplants", "Expected work: gradually acclimate seedlings to outdoor light, wind, and watering before planting.", "high"),
              task("stage-transplant-trays", "Stage seedlings for transplant day", "Expected work: group, water, and move seedlings so the field crew can plant efficiently."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "compostPlanning",
    group: "administrationPlanning",
    title: "Compost administration and planning",
    shortTitle: "Compost admin",
    setupQuestion: "Do you plan compost sites, feedstocks, monitoring schedules, or compost applications?",
    description: "Adds compost-site, feedstock, monitoring, finished-compost, and application planning tasks.",
    suggestedFor: ["compost plans", "soil amendments", "manure bedding", "crop residues"],
    goals: [
      {
        key: "compost-planning",
        title: "Plan compost work",
        description: "Prepare compost locations, materials, checks, and field-use plans.",
        category: "soilHealth",
        subgoals: [
          {
            key: "compost-system-planning",
            title: "Plan compost system",
            description: "Decide where, how, and when compost will be managed.",
            tasks: [
              task("choose-compost-site", "Choose compost site", "Expected work: choose a practical compost site with access, drainage, and low runoff risk.", "high"),
              task("estimate-compost-feedstocks", "Estimate compost carbon and nitrogen materials", "Expected work: list available browns, greens, manure, crop residues, and rough volumes before building piles."),
              task("set-compost-monitoring-schedule", "Set compost monitoring schedule", "Expected work: decide when moisture, temperature, odor, and turning checks should happen."),
              task("plan-finished-compost-use", "Plan finished compost use", "Expected work: decide likely field, bed, greenhouse, or mulch uses for finished compost."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "compostWork",
    group: "farmWork",
    title: "Composting work",
    shortTitle: "Compost work",
    setupQuestion: "Do you want compost pile building, moisture, temperature, turning, curing, and application tasks?",
    description: "Adds pile building, covering, moisture checks, water additions, temperature checks, turning, odor/pest checks, finishing, staging, and application records.",
    suggestedFor: ["compost piles", "manure bedding", "crop residues", "soil amendments"],
    goals: [
      {
        key: "compost-work",
        title: "Do compost work",
        description: "Build and manage compost piles for soil amendment use.",
        category: "soilHealth",
        subgoals: [
          {
            key: "build-compost",
            title: "Build compost piles",
            description: "Build piles with enough material, moisture, and structure.",
            tasks: [
              task("gather-carbon-materials", "Gather carbon materials", "Expected work: gather leaves, straw, bedding, stalks, chips, or other browns."),
              task("gather-nitrogen-materials", "Gather nitrogen materials", "Expected work: gather greens, manure, crop residues, or other nitrogen-rich materials."),
              task("build-compost-pile", "Build compost pile", "Expected work: combine materials, shape the pile, and add water if needed."),
              task("cover-new-pile-if-needed", "Cover compost pile if weather calls for it", "Expected work: cover the pile during wet or cold conditions when saturation or heat loss is likely."),
            ],
          },
          {
            key: "manage-compost",
            title: "Manage compost piles",
            description: "Track pile moisture, heat, turning, curing, and application readiness.",
            tasks: [
              task("check-compost-moisture", "Check compost pile moisture", "Expected work: check whether the pile is too dry, damp like a wrung-out sponge, or too wet.", "high"),
              task("add-water-compost", "Add water if compost is too dry", "Expected work: add water while building or turning when the pile is drying out."),
              task("check-compost-temperature", "Check compost temperature", "Expected work: check internal pile temperature and record the reading when useful.", "high"),
              task("turn-compost-pile", "Turn compost pile", "Expected work: turn the pile to add air, mix materials, and redistribute moisture.", "high"),
              task("check-compost-odor-pests", "Check compost odor or pest issues", "Expected work: note odor, flies, rodents, or other signs that moisture, cover, or feedstock mix needs attention."),
              task("decide-compost-finished", "Decide whether compost is finished", "Expected work: check whether turning no longer reheats the pile and whether the compost is ready to cure or use."),
              task("stage-finished-compost", "Screen or stage finished compost", "Expected work: screen, pile, or store finished compost for field, greenhouse, or mulch use."),
              task("record-compost-application", "Record where compost was applied", "Expected work: note the field, bed, crop, date, and approximate amount where compost is applied."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chickenCarePlanning",
    group: "administrationPlanning",
    title: "Chicken care administration and planning",
    shortTitle: "Chicken admin",
    setupQuestion: "Do you plan feed, bedding, coop maintenance, flock records, or predator-protection follow-up?",
    description: "Adds feed, bedding, egg-count, coop-cleaning, and predator-protection planning tasks.",
    suggestedFor: ["laying hens", "broilers", "flock records", "feed planning", "coop maintenance"],
    goals: [
      {
        key: "chicken-care-planning",
        title: "Plan chicken care",
        description: "Keep flock supplies, records, and follow-up care planned.",
        category: "general",
        subgoals: [
          {
            key: "flock-admin",
            title: "Manage flock records and supplies",
            description: "Track flock records and supply decisions that support daily care.",
            tasks: [
              task("plan-feed-needs", "Plan chicken feed needs", "Expected work: estimate feed needs by flock stage and create reorder follow-up before feed runs low.", "high"),
              task("record-egg-count", "Record egg count", "Expected work: note the egg count so production changes are easier to notice."),
              task("review-bedding-nest-supplies", "Review bedding and nest supplies", "Expected work: check bedding, nesting material, grit, oyster shell, and other flock supplies."),
              task("schedule-coop-deep-clean", "Schedule coop deep clean", "Expected work: plan a deeper coop clean when bedding, odor, pests, or season change calls for it."),
              task("plan-predator-repair-follow-up", "Plan predator-protection repairs", "Expected work: list latch, fencing, netting, door, or gap repairs found during checks."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chickenCareWork",
    group: "farmWork",
    title: "Chicken care work",
    shortTitle: "Chicken work",
    setupQuestion: "Do you want daily chicken feed, water, egg, health, bedding, coop, and predator-check tasks?",
    description: "Adds daily feed/water, egg collection, waterer cleaning, health checks, bedding, nest boxes, ventilation, and predator checks.",
    suggestedFor: ["laying hens", "broilers", "chicks", "pastured poultry", "coop chores"],
    goals: [
      {
        key: "chicken-care-work",
        title: "Do chicken care work",
        description: "Keep daily chicken care, eggs, health checks, bedding, and coop protection visible.",
        category: "general",
        subgoals: [
          {
            key: "daily-chicken-care",
            title: "Do daily chicken care",
            description: "Handle the daily flock checks that protect bird health and egg quality.",
            tasks: [
              task("feed-chickens", "Feed chickens", "Expected work: provide the right feed for the flock stage and check that feeders are usable.", "high"),
              task("refresh-drinking-water", "Refresh drinking water", "Expected work: provide clean water and check that waterers are not empty, dirty, frozen, or tipped.", "high"),
              task("clean-waterers", "Clean waterers", "Expected work: clean waterers often enough to keep water fresh and visible debris out."),
              task("collect-eggs", "Collect eggs", "Expected work: collect eggs and separate cracked, dirty, or questionable eggs when needed.", "high"),
              task("check-flock-health", "Check flock behavior and health", "Expected work: look for unusual behavior, injury, illness, mites, respiratory signs, or dead birds.", "high"),
            ],
          },
          {
            key: "coop-care",
            title: "Maintain coop and protection",
            description: "Keep housing, bedding, feed supply, and predator protection in working order.",
            tasks: [
              task("check-coop-ventilation", "Check coop ventilation", "Expected work: check that the coop has fresh air without harmful drafts or wet bedding."),
              task("refresh-bedding", "Refresh bedding", "Expected work: add or replace bedding where manure, moisture, or ammonia is building up."),
              task("clean-nest-boxes", "Clean nest boxes", "Expected work: replace dirty nesting material so eggs stay cleaner."),
              task("check-predator-protection", "Check predator protection", "Expected work: check doors, latches, fencing, netting, and gaps for predator risk.", "high"),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "irrigationPlanning",
    group: "administrationPlanning",
    title: "Irrigation administration and planning",
    shortTitle: "Irrigation admin",
    setupQuestion: "Do you plan irrigation zones, supplies, weather adjustments, or seasonal irrigation schedules?",
    description: "Adds irrigation supply, zone-map, watering-target, rain/heat, and season-end planning tasks.",
    suggestedFor: ["drip planning", "water schedules", "irrigation zones", "greenhouse watering"],
    goals: [
      {
        key: "irrigation-planning",
        title: "Plan irrigation work",
        description: "Prepare irrigation supplies, zones, and decision rules before dry weather makes work urgent.",
        category: "infrastructure",
        subgoals: [
          {
            key: "irrigation-system-planning",
            title: "Plan irrigation system",
            description: "Clarify supplies, zones, and watering decisions before irrigation runs.",
            tasks: [
              task("check-irrigation-supplies", "Check irrigation supplies", "Expected work: check drip tape, hoses, fittings, filters, timers, valves, and repair parts.", "high"),
              task("map-irrigation-zones", "Map irrigation zones by field or bed", "Expected work: list which beds, fields, greenhouse areas, or crops each irrigation zone serves."),
              task("set-irrigation-schedule-targets", "Set irrigation schedule targets", "Expected work: decide normal watering frequency or soil-moisture targets by crop group."),
              task("plan-rain-heat-adjustments", "Plan rain and heat irrigation adjustments", "Expected work: note how rain, wind, heat, crop stage, or soil moisture should change irrigation timing."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "irrigationWork",
    group: "farmWork",
    title: "Irrigation work",
    shortTitle: "Irrigation work",
    setupQuestion: "Do you want irrigation setup, leak checks, watering decisions, run-time records, and winterizing tasks?",
    description: "Adds line installation, system testing, repairs, soil-moisture checks, run-time tasks, records, rain adjustments, heat-stress checks, and winterizing tasks.",
    suggestedFor: ["drip tape", "vegetable irrigation", "greenhouse watering", "soil moisture checks"],
    goals: [
      {
        key: "irrigation-work",
        title: "Do irrigation work",
        description: "Keep irrigation setup, water decisions, and repairs visible through the season.",
        category: "infrastructure",
        subgoals: [
          {
            key: "irrigation-setup",
            title: "Set up irrigation",
            description: "Install and test the system before dry weather makes irrigation urgent.",
            tasks: [
              task("install-irrigation-lines", "Install drip tape or irrigation lines", "Expected work: lay lines, connect headers, and place irrigation where crops need it."),
              task("test-irrigation-system", "Test irrigation system for leaks", "Expected work: run the system and find leaks, clogs, pressure issues, or missing caps.", "high"),
              task("repair-irrigation-lines", "Repair clogged or damaged irrigation lines", "Expected work: fix leaks, clogged emitters, damaged tape, or broken fittings."),
            ],
          },
          {
            key: "irrigation-management",
            title: "Manage irrigation decisions",
            description: "Decide when and how long to irrigate based on crop, weather, and soil moisture.",
            tasks: [
              task("check-soil-moisture", "Check soil moisture", "Expected work: check soil feel, sensor reading, or crop stress before deciding whether to water.", "high"),
              task("decide-irrigation-needed", "Decide whether irrigation is needed", "Expected work: compare soil moisture, weather, crop stage, and recent rainfall."),
              task("run-irrigation", "Run irrigation by crop or bed", "Expected work: irrigate the selected crop, bed, or field for the chosen duration.", "high"),
              task("record-irrigation", "Record irrigation date and duration", "Expected work: note where irrigation ran, how long it ran, and any rainfall adjustment."),
              task("adjust-after-rain", "Adjust irrigation after rain", "Expected work: reduce, skip, or reschedule irrigation after useful rainfall."),
              task("check-heat-stress", "Check field after heat or wind stress", "Expected work: check crop stress and soil moisture after hot, windy, or dry conditions."),
              task("remove-irrigation-season-end", "Remove or winterize irrigation lines", "Expected work: remove, drain, store, or winterize irrigation parts at season end."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "harvestWashPackPlanning",
    group: "administrationPlanning",
    title: "Harvest and wash/pack administration and planning",
    shortTitle: "Harvest admin",
    setupQuestion: "Do you plan harvest lists, packing needs, labels, wash/pack supplies, or market loading?",
    description: "Adds harvest-list, packing-plan, label, food-contact supply, and market/delivery planning tasks.",
    suggestedFor: ["harvest planning", "CSA", "farmers market", "wash/pack records", "cooler planning"],
    goals: [
      {
        key: "harvest-wash-pack-planning",
        title: "Plan harvest and wash/pack work",
        description: "Prepare harvest priorities, packing needs, labels, and supplies before produce comes in.",
        category: "sales",
        subgoals: [
          {
            key: "harvest-pack-planning",
            title: "Plan harvest and packing",
            description: "Set harvest expectations and packing materials before field work starts.",
            tasks: [
              task("prepare-harvest-list", "Prepare harvest list", "Expected work: list crops, quantities, places, and destinations for the harvest.", "high"),
              task("prepare-pack-plan", "Prepare market, CSA, or delivery pack plan", "Expected work: list pack sizes, container counts, customer groups, and delivery or market needs."),
              task("review-label-needs", "Review label needs", "Expected work: identify labels needed for packed items, lots, customers, market display, or storage."),
              task("review-food-contact-supplies", "Review wash/pack and food-contact supplies", "Expected work: check sanitizer, soap, towels, liners, bags, boxes, rubber bands, labels, and gloves where used."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "harvestWashPackWork",
    group: "farmWork",
    title: "Harvest and wash/pack work",
    shortTitle: "Harvest work",
    setupQuestion: "Do you want harvest, washing, packing, cooler, cleaning, and market-loading tasks?",
    description: "Adds handwashing setup, clean tools and totes, harvest, harvest quantity records, washing, packing, labeling, cooling, sanitation, loading, and cull records.",
    suggestedFor: ["farmers market", "CSA", "wholesale produce", "wash/pack area", "coolers"],
    goals: [
      {
        key: "harvest-wash-pack-work",
        title: "Do harvest and wash/pack work",
        description: "Harvest produce safely and prepare it for market, CSA, storage, or kitchen use.",
        category: "sales",
        subgoals: [
          {
            key: "harvest-prep",
            title: "Prepare for and do harvest",
            description: "Prepare people, tools, containers, and harvest work before produce comes in.",
            tasks: [
              task("set-up-handwashing", "Set up handwashing station", "Expected work: make sure potable water, soap, towels, catch bucket, and trash are available."),
              task("clean-harvest-bins", "Clean harvest bins", "Expected work: remove soil and debris from harvest containers before use.", "high"),
              task("clean-harvest-tools", "Clean harvest tools", "Expected work: clean knives, snips, pruners, and other tools before harvest."),
              task("harvest-crop", "Harvest crop by bed or field", "Expected work: harvest into clean containers and note crop, place, and quantity when useful.", "high"),
              task("record-harvest-quantity", "Record harvest quantity", "Expected work: enter harvest quantities for crops that matter for inventory, sales, or records."),
            ],
          },
          {
            key: "wash-pack",
            title: "Wash, pack, cool, and load",
            description: "Move produce through washing, packing, cooling, cleaning, and delivery prep.",
            tasks: [
              task("move-produce-to-wash-pack", "Move produce to wash/pack area", "Expected work: move harvested produce to the right wash, pack, cooler, or storage place."),
              task("wash-produce-if-needed", "Wash produce if appropriate for crop", "Expected work: wash, spray, dunk, or leave unwashed based on crop needs and farm practice."),
              task("dry-or-cool-produce", "Dry or cool produce", "Expected work: air dry, drain, hydro-cool, or move produce to cooler/storage as needed."),
              task("pack-produce", "Pack produce for market, CSA, or storage", "Expected work: pack produce into the intended containers and note special handling."),
              task("label-packed-produce", "Label packed produce", "Expected work: label packed items when needed for customer, lot, market, or delivery clarity."),
              task("clean-sanitize-tools-totes", "Clean and sanitize tools, totes, and food-contact surfaces", "Expected work: rinse, wash, rinse, sanitize, and air dry harvest tools, totes, and food-contact surfaces.", "high"),
              task("check-cooler-storage", "Check cooler or storage conditions", "Expected work: check temperature, airflow, cleanliness, and crop placement in storage."),
              task("load-market-supplies", "Load market or delivery supplies", "Expected work: load produce, tables, scales, bags, signs, ice, cash box, and other supplies."),
              task("record-unsold-culled-product", "Record unsold or culled product", "Expected work: note unsold, donated, composted, or culled quantities when useful."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "materialOrderingPlanning",
    group: "administrationPlanning",
    title: "Material ordering administration and planning",
    shortTitle: "Materials admin",
    setupQuestion: "Do you plan seed, soil mix, amendment, packaging, harvest supply, or maintenance part orders?",
    description: "Adds inventory review, order-list, supplier, cost, and low-stock follow-up tasks.",
    suggestedFor: ["seed orders", "soil mix", "fertility materials", "packaging", "harvest supplies"],
    goals: [
      {
        key: "material-ordering-planning",
        title: "Plan farm material ordering",
        description: "Keep farm supplies visible before low stock becomes urgent.",
        category: "general",
        subgoals: [
          {
            key: "review-inventory",
            title: "Review farm supply inventory",
            description: "Check what is on hand before buying or starting seasonal work.",
            tasks: [
              task("review-seed-inventory", "Review seed inventory", "Expected work: check seed on hand, old seed, missing varieties, and packets that need replacing.", "high"),
              task("review-potting-mix-inventory", "Review potting mix inventory", "Expected work: check seed-starting mix, potting mix, compost, trays, and related greenhouse supplies."),
              task("review-amendment-inventory", "Review fertilizer and amendment inventory", "Expected work: check amendments, inoculants, minerals, compost, mulch, and related materials."),
              task("review-packaging-inventory", "Review packaging supplies", "Expected work: check boxes, bags, rubber bands, labels, twist ties, clamshells, and market supplies."),
              task("review-harvest-supplies", "Review harvest supplies", "Expected work: check harvest knives, bins, totes, buckets, liners, sanitizer, soap, and towels."),
            ],
          },
          {
            key: "order-materials",
            title: "Plan and place material orders",
            description: "Turn inventory gaps into clear orders and follow-up records.",
            tasks: [
              task("create-order-list", "Create material order list", "Expected work: list items, quantities, supplier, priority, and needed-by date.", "high"),
              task("place-seed-order", "Place seed order", "Expected work: order needed seeds and note supplier and expected delivery."),
              task("place-greenhouse-order", "Place greenhouse supply order", "Expected work: order trays, soil mix, labels, germination supplies, and greenhouse repair supplies."),
              task("place-packaging-order", "Place packaging order", "Expected work: order boxes, bags, bands, labels, or market packaging."),
              task("record-supplier-cost", "Record supplier, quantity, and cost", "Expected work: note supplier, quantity, cost, and receipt location when useful for planning."),
              task("flag-low-stock", "Flag low-stock items for reorder", "Expected work: create follow-up tasks for supplies that remain low after receiving orders."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "materialOrderingWork",
    group: "farmWork",
    title: "Material receiving and storage work",
    shortTitle: "Materials work",
    setupQuestion: "Do you want physical receiving, checking, labeling, and storage tasks for farm supplies?",
    description: "Adds receiving, damage checks, labeling, storage, and follow-up staging tasks for farm materials.",
    suggestedFor: ["delivered supplies", "seed storage", "amendment storage", "packaging", "harvest supplies"],
    goals: [
      {
        key: "material-handling-work",
        title: "Handle farm materials",
        description: "Receive and store farm materials so supplies stay usable and easy to find.",
        category: "general",
        subgoals: [
          {
            key: "receive-store-materials",
            title: "Receive and store materials",
            description: "Check arriving materials and put them where they belong.",
            tasks: [
              task("receive-materials", "Receive materials", "Expected work: check incoming materials against the order and note missing or damaged items."),
              task("label-received-materials", "Label received materials", "Expected work: label materials with crop, use, date, supplier, lot, or storage notes when useful."),
              task("store-materials", "Store materials in correct location", "Expected work: put materials where they will stay dry, labeled, accessible, and separate when needed."),
              task("stage-materials-for-work", "Stage materials for upcoming work", "Expected work: move supplies to the greenhouse, wash/pack, field, coop, or shop before scheduled work."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "equipmentMaintenancePlanning",
    group: "administrationPlanning",
    title: "Equipment maintenance administration and planning",
    shortTitle: "Equipment admin",
    setupQuestion: "Do you plan maintenance schedules, repair lists, seasonal cleanup, or parts orders?",
    description: "Adds maintenance checklist, repair-record, winterizing schedule, and parts-order planning tasks.",
    suggestedFor: ["tool records", "repair planning", "parts ordering", "seasonal cleanup", "winterizing"],
    goals: [
      {
        key: "equipment-maintenance-planning",
        title: "Plan equipment maintenance",
        description: "Keep repair needs, seasonal maintenance, and parts ordering organized.",
        category: "equipment",
        subgoals: [
          {
            key: "maintenance-admin",
            title: "Manage maintenance records and parts",
            description: "Turn inspections and seasonal needs into clear maintenance follow-up.",
            tasks: [
              task("create-seasonal-maintenance-checklist", "Create seasonal maintenance checklist", "Expected work: list the tools, equipment, pumps, wash/pack gear, greenhouse systems, and seasonal items to inspect."),
              task("record-repair-needs", "Record repair needs", "Expected work: list broken, unsafe, or missing equipment and create follow-up tasks for repairs."),
              task("schedule-winterizing-work", "Schedule winterizing work", "Expected work: set target dates for irrigation, pumps, hoses, covers, heaters, and other freeze-sensitive systems."),
              task("plan-maintenance-parts-order", "Plan maintenance parts order", "Expected work: list belts, filters, oil, blades, fittings, repair parts, and other parts to order."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "equipmentMaintenanceWork",
    group: "farmWork",
    title: "Equipment and seasonal maintenance work",
    shortTitle: "Equipment work",
    setupQuestion: "Do you want hands-on tool, equipment, pump, greenhouse, wash/pack, and winterizing tasks?",
    description: "Adds inspection, sharpening, cleaning, tire/fluid checks, greasing, pump checks, greenhouse system checks, wash/pack cleaning, winterizing, and storage tasks.",
    suggestedFor: ["hand tools", "tractors", "wash/pack equipment", "pumps", "seasonal cleanup"],
    goals: [
      {
        key: "equipment-maintenance-work",
        title: "Do equipment maintenance work",
        description: "Keep tools, machines, pumps, greenhouse systems, and seasonal infrastructure ready.",
        category: "equipment",
        subgoals: [
          {
            key: "tool-equipment-checks",
            title: "Inspect and service tools",
            description: "Keep common tools and machinery clean, safe, and ready to use.",
            tasks: [
              task("inspect-hand-tools", "Inspect hand tools", "Expected work: check handles, blades, fasteners, and missing tools."),
              task("sharpen-tools", "Sharpen harvest knives, pruners, or hoes", "Expected work: sharpen or replace dull tools before they slow work or damage crops."),
              task("clean-machinery", "Clean tractors or machinery", "Expected work: remove plant debris, soil, dust, and buildup that can create safety, fire, or biosecurity risks.", "high"),
              task("check-tires", "Check tire pressure", "Expected work: check tires on tractors, carts, trailers, or other equipment."),
              task("check-fluids", "Check fluids", "Expected work: check fuel, oil, coolant, hydraulic fluid, and other fluids where applicable."),
              task("grease-moving-parts", "Grease moving parts where applicable", "Expected work: grease zerks, bearings, joints, or moving parts according to the equipment manual."),
            ],
          },
          {
            key: "seasonal-maintenance",
            title: "Do seasonal maintenance",
            description: "Prepare infrastructure for busy-season use or end-of-season storage.",
            tasks: [
              task("inspect-irrigation-pump", "Inspect irrigation pump", "Expected work: check pump, filters, pressure, fittings, and leaks before irrigation season."),
              task("inspect-greenhouse-systems", "Inspect greenhouse fans, vents, and heaters", "Expected work: check greenhouse controls, ventilation, heat, cords, fuel, and safety concerns."),
              task("clean-wash-pack-equipment", "Clean wash/pack equipment", "Expected work: clean spray tables, sinks, brush washers, scales, surfaces, and drains."),
              task("winterize-irrigation-lines", "Winterize irrigation lines", "Expected work: drain, remove, store, or protect lines, pumps, filters, and fittings for freezing weather."),
              task("store-row-cover-tarps", "Store row cover, tarps, and tools", "Expected work: dry, fold, label, and store covers, tarps, hoops, stakes, and tools."),
            ],
          },
        ],
      },
    ],
  },
];

export function listFarmWorkPacks(group?: FarmWorkPackGroup): FarmWorkPack[] {
  return group ? FARM_WORK_PACKS.filter((pack) => pack.group === group) : FARM_WORK_PACKS;
}

export async function getFarmWorkPackSetupSummary(
  input: { farmId: FarmId; group?: FarmWorkPackGroup },
  dependencies: { repository: PlanningRepository },
): Promise<FarmWorkPackSetupSummary[]> {
  const [existingGoals, existingTasks, packStates, itemStates] = await Promise.all([
    dependencies.repository.listGoals(input.farmId, { source: "farmWorkTemplate" }),
    dependencies.repository.listTasks(input.farmId, { source: "farmWorkTemplate" }),
    dependencies.repository.listFarmWorkPackStates(input.farmId),
    dependencies.repository.listFarmWorkPackItemStates(input.farmId),
  ]);
  const statesByPackId = new Map(packStates.map((state) => [state.packId, state]));
  const itemStatesByTemplateKey = new Map(itemStates.map((state) => [state.templateKey, state]));
  const existingTemplateKeys = new Set([
    ...existingGoals.map((goal) => goal.templateKey).filter(isDefinedString),
    ...existingTasks.map((task) => task.templateKey).filter(isDefinedString),
  ]);

  return listFarmWorkPacks(input.group).map((pack) => {
    const counts = countPackRecords(pack);
    return {
      id: pack.id,
      group: pack.group,
      title: pack.title,
      shortTitle: pack.shortTitle,
      setupQuestion: pack.setupQuestion,
      description: pack.description,
      suggestedFor: pack.suggestedFor,
      goalCount: counts.goals,
      taskCount: counts.tasks,
      isApplied: collectPackTemplateKeys(pack).some((key) => existingTemplateKeys.has(key)),
      isActive: isPackActive(pack.id, existingTemplateKeys, statesByPackId.get(pack.id)),
      goals: summarizePackGoals(pack, existingTemplateKeys, itemStatesByTemplateKey),
    };
  });
}

export async function ensureFarmWorkPacks(
  input: { farmId: FarmId; packIds: string[]; taskTemplateKeysByPackId?: Partial<Record<FarmWorkPackId, string[]>> },
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: PlanningRepository },
): Promise<{ goals: PlanningGoal[]; tasks: PlanningTask[]; packIds: FarmWorkPackId[] }> {
  const packs = resolvePacks(input.packIds);
  const existingGoals = await dependencies.repository.listGoals(input.farmId, { source: "farmWorkTemplate" });
  const existingTasks = await dependencies.repository.listTasks(input.farmId, { source: "farmWorkTemplate" });
  const existingPackStates = await dependencies.repository.listFarmWorkPackStates(input.farmId);
  const existingItemStates = await dependencies.repository.listFarmWorkPackItemStates(input.farmId);
  const goals: PlanningGoal[] = [];
  const tasks: PlanningTask[] = [];
  const appliedPackIds: FarmWorkPackId[] = [];

  for (const [packIndex, pack] of packs.entries()) {
    const selectedTaskKeys = selectedTaskTemplateKeysForPack(pack, input.taskTemplateKeysByPackId?.[pack.id]);
    if (!selectedTaskKeys.size) {
      continue;
    }
    let packWasApplied = false;

    for (const [goalIndex, goalTemplate] of pack.goals.entries()) {
      const selectedSubgoals = goalTemplate.subgoals
        .map((subgoalTemplate) => ({
          subgoalTemplate,
          tasks: subgoalTemplate.tasks.filter((taskTemplate) =>
            selectedTaskKeys.has(templateKey(pack.id, "task", `${subgoalTemplate.key}-${taskTemplate.key}`))),
        }))
        .filter((subgoal) => subgoal.tasks.length > 0);
      if (!selectedSubgoals.length) {
        continue;
      }

      const rootGoal = await ensureGoal(
        {
          category: goalTemplate.category,
          description: goalTemplate.description,
          farmId: input.farmId,
          key: templateKey(pack.id, "goal", goalTemplate.key),
          parentGoalId: undefined,
          sortOrder: packIndex * 100 + goalIndex + 1,
          status: "active",
          title: goalTemplate.title,
        },
        existingGoals,
        dependencies,
      );
      goals.push(rootGoal);
      packWasApplied = true;

      for (const [subgoalIndex, { subgoalTemplate, tasks: selectedTasks }] of selectedSubgoals.entries()) {
        const subgoalTemplateKey = templateKey(pack.id, "subgoal", subgoalTemplate.key);
        const subgoal = await ensureGoal(
          {
            category: goalTemplate.category,
            description: subgoalTemplate.description,
            farmId: input.farmId,
            key: subgoalTemplateKey,
            parentGoalId: rootGoal.id,
            sortOrder: subgoalIndex + 1,
            status: "planned",
            title: subgoalTemplate.title,
          },
          existingGoals,
          dependencies,
        );
        goals.push(subgoal);
        await savePackItemState(
          { farmId: input.farmId, templateKey: subgoalTemplateKey, isActive: true },
          existingItemStates,
          dependencies,
        );

        for (const [taskIndex, taskTemplate] of selectedTasks.entries()) {
          const taskTemplateKey = templateKey(pack.id, "task", `${subgoalTemplate.key}-${taskTemplate.key}`);
          tasks.push(await ensureTask(
            {
              farmId: input.farmId,
              goalId: subgoal.id,
              key: taskTemplateKey,
              notes: taskTemplate.notes,
              priority: taskTemplate.priority ?? "normal",
              estimatedMinutes: taskTemplate.estimatedMinutes,
              sortOrder: taskIndex + 1,
              title: taskTemplate.title,
            },
            existingTasks,
            dependencies,
          ));
          await savePackItemState(
            { farmId: input.farmId, templateKey: taskTemplateKey, isActive: true },
            existingItemStates,
            dependencies,
          );
        }
      }
    }

    if (packWasApplied) {
      appliedPackIds.push(pack.id);
      await savePackState(
        {
          farmId: input.farmId,
          packId: pack.id,
          isActive: true,
        },
        existingPackStates,
        dependencies,
      );
    }
  }

  return { goals, tasks, packIds: appliedPackIds };
}

export async function setFarmWorkPackActive(
  input: { farmId: FarmId; packId: string; isActive: boolean },
  dependencies: { clock: Clock; repository: PlanningRepository },
): Promise<PlanningFarmWorkPackState> {
  const [pack] = resolvePacks([input.packId]);
  const [existingGoals, existingTasks, existingPackStates] = await Promise.all([
    dependencies.repository.listGoals(input.farmId, { source: "farmWorkTemplate" }),
    dependencies.repository.listTasks(input.farmId, { source: "farmWorkTemplate" }),
    dependencies.repository.listFarmWorkPackStates(input.farmId),
  ]);
  const existingTemplateKeys = new Set([
    ...existingGoals.map((goal) => goal.templateKey).filter(isDefinedString),
    ...existingTasks.map((task) => task.templateKey).filter(isDefinedString),
  ]);
  const isApplied = collectPackTemplateKeys(pack).some((key) => existingTemplateKeys.has(key));

  if (!isApplied) {
    throw new Error("Starter work pack has not been added.");
  }

  return savePackState(
    {
      farmId: input.farmId,
      packId: pack.id,
      isActive: input.isActive,
    },
    existingPackStates,
    dependencies,
  );
}

export async function listInactiveFarmWorkPackIds(
  input: { farmId: FarmId },
  dependencies: { repository: PlanningRepository },
): Promise<FarmWorkPackId[]> {
  const states = await dependencies.repository.listFarmWorkPackStates(input.farmId);
  return states
    .filter((state) => !state.isActive && isFarmWorkPackId(state.packId))
    .map((state) => state.packId as FarmWorkPackId);
}

export async function setFarmWorkPackItemActive(
  input: { farmId: FarmId; templateKey: string; isActive: boolean },
  dependencies: { clock: Clock; repository: PlanningRepository },
): Promise<PlanningFarmWorkPackItemState> {
  const parsedTemplateKey = parseFarmWorkPackTemplateKey(input.templateKey);
  if (!parsedTemplateKey || parsedTemplateKey.kind === "goal") {
    throw new Error("Starter work pack goals are changed through the pack switch.");
  }

  const [existingGoals, existingTasks, existingItemStates] = await Promise.all([
    dependencies.repository.listGoals(input.farmId, { source: "farmWorkTemplate" }),
    dependencies.repository.listTasks(input.farmId, { source: "farmWorkTemplate" }),
    dependencies.repository.listFarmWorkPackItemStates(input.farmId),
  ]);
  const isApplied = parsedTemplateKey.kind === "subgoal"
    ? existingGoals.some((goal) => goal.templateKey === input.templateKey)
    : existingTasks.some((taskRecord) => taskRecord.templateKey === input.templateKey);

  if (!isApplied) {
    throw new Error("Starter work pack item has not been added.");
  }

  return savePackItemState(input, existingItemStates, dependencies);
}

export async function listInactiveFarmWorkPackItemTemplateKeys(
  input: { farmId: FarmId },
  dependencies: { repository: PlanningRepository },
): Promise<string[]> {
  const states = await dependencies.repository.listFarmWorkPackItemStates(input.farmId);
  return states
    .filter((state) => !state.isActive && Boolean(parseFarmWorkPackTemplateKey(state.templateKey)))
    .map((state) => state.templateKey);
}

function task(
  key: string,
  title: string,
  notes: string,
  priority?: PlanningTaskPriority,
  estimatedMinutes?: number,
): FarmWorkPackTaskTemplate {
  return { key, title, notes, priority, estimatedMinutes };
}

async function ensureGoal(
  input: {
    category: PlanningGoalCategory;
    description: string;
    farmId: FarmId;
    key: string;
    parentGoalId?: string;
    sortOrder: number;
    status: PlanningGoal["status"];
    title: string;
  },
  existingGoals: PlanningGoal[],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: PlanningRepository },
): Promise<PlanningGoal> {
  const existing = existingGoals.find((goal) => goal.templateKey === input.key);
  if (existing) {
    return existing;
  }

  return savePlanningGoal(
    {
      farmId: input.farmId,
      parentGoalId: input.parentGoalId,
      title: input.title,
      description: input.description,
      category: input.category,
      status: input.status,
      source: "farmWorkTemplate",
      templateKey: input.key,
      sortOrder: input.sortOrder,
    },
    dependencies,
  );
}

async function ensureTask(
  input: {
    estimatedMinutes?: number;
    farmId: FarmId;
    goalId: string;
    key: string;
    notes: string;
    priority: PlanningTaskPriority;
    sortOrder: number;
    title: string;
  },
  existingTasks: PlanningTask[],
  dependencies: { clock: Clock; idGenerator: IdGenerator; repository: PlanningRepository },
): Promise<PlanningTask> {
  const existing = existingTasks.find((task) => task.templateKey === input.key);
  if (existing) {
    return existing;
  }

  return savePlanningTask(
    {
      farmId: input.farmId,
      goalId: input.goalId,
      title: input.title,
      notes: input.notes,
      status: "notStarted",
      priority: input.priority,
      estimatedMinutes: input.estimatedMinutes,
      source: "farmWorkTemplate",
      templateKey: input.key,
      sortOrder: input.sortOrder,
    },
    dependencies,
  );
}

function resolvePacks(packIds: string[]): FarmWorkPack[] {
  const uniquePackIds = [...new Set(packIds)];
  const packsById = new Map(FARM_WORK_PACKS.map((pack) => [pack.id, pack]));

  return uniquePackIds.map((packId) => {
    const pack = packsById.get(packId as FarmWorkPackId);
    if (!pack) {
      throw new Error("Farm work pack does not exist.");
    }
    return pack;
  });
}

function selectedTaskTemplateKeysForPack(pack: FarmWorkPack, selectedKeys: string[] | undefined): Set<string> {
  const validTaskKeys = new Set(collectPackTaskTemplateKeys(pack));
  if (!selectedKeys) {
    return validTaskKeys;
  }

  const selected = new Set<string>();
  for (const key of selectedKeys) {
    if (!validTaskKeys.has(key)) {
      throw new Error("Starter work pack task does not exist.");
    }
    selected.add(key);
  }
  return selected;
}

function countPackRecords(pack: FarmWorkPack): { goals: number; tasks: number } {
  return pack.goals.reduce(
    (counts, goal) => ({
      goals: counts.goals + 1 + goal.subgoals.length,
      tasks: counts.tasks + goal.subgoals.reduce((total, subgoal) => total + subgoal.tasks.length, 0),
    }),
    { goals: 0, tasks: 0 },
  );
}

function summarizePackGoals(
  pack: FarmWorkPack,
  existingTemplateKeys: Set<string>,
  itemStatesByTemplateKey: Map<string, PlanningFarmWorkPackItemState>,
): FarmWorkPackGoalSetupSummary[] {
  return pack.goals.map((goal) => {
    const goalTemplateKey = templateKey(pack.id, "goal", goal.key);
    const goalIsApplied = existingTemplateKeys.has(goalTemplateKey);
    return {
      key: goal.key,
      title: goal.title,
      description: goal.description,
      templateKey: goalTemplateKey,
      isApplied: goalIsApplied,
      isActive: goalIsApplied,
      subgoals: goal.subgoals.map((subgoal) => {
        const subgoalTemplateKey = templateKey(pack.id, "subgoal", subgoal.key);
        const subgoalIsApplied = existingTemplateKeys.has(subgoalTemplateKey);
        return {
          key: subgoal.key,
          title: subgoal.title,
          description: subgoal.description,
          templateKey: subgoalTemplateKey,
          isApplied: subgoalIsApplied,
          isActive: isPackItemActive(subgoalTemplateKey, subgoalIsApplied, itemStatesByTemplateKey.get(subgoalTemplateKey)),
          tasks: subgoal.tasks.map((taskTemplate) => {
            const taskTemplateKey = templateKey(pack.id, "task", `${subgoal.key}-${taskTemplate.key}`);
            const taskIsApplied = existingTemplateKeys.has(taskTemplateKey);
            return {
              ...taskTemplate,
              templateKey: taskTemplateKey,
              isApplied: taskIsApplied,
              isActive: isPackItemActive(taskTemplateKey, taskIsApplied, itemStatesByTemplateKey.get(taskTemplateKey)),
            };
          }),
        };
      }),
    };
  });
}

function collectPackTemplateKeys(pack: FarmWorkPack): string[] {
  return pack.goals.flatMap((goal) => [
    templateKey(pack.id, "goal", goal.key),
    ...goal.subgoals.flatMap((subgoal) => [
      templateKey(pack.id, "subgoal", subgoal.key),
      ...subgoal.tasks.map((taskTemplate) => templateKey(pack.id, "task", `${subgoal.key}-${taskTemplate.key}`)),
    ]),
  ]);
}

function collectPackTaskTemplateKeys(pack: FarmWorkPack): string[] {
  return pack.goals.flatMap((goal) =>
    goal.subgoals.flatMap((subgoal) =>
      subgoal.tasks.map((taskTemplate) => templateKey(pack.id, "task", `${subgoal.key}-${taskTemplate.key}`))));
}

async function savePackState(
  input: { farmId: FarmId; packId: FarmWorkPackId; isActive: boolean },
  existingPackStates: PlanningFarmWorkPackState[],
  dependencies: { clock: Clock; repository: PlanningRepository },
): Promise<PlanningFarmWorkPackState> {
  const existing = existingPackStates.find((state) => state.packId === input.packId);
  const now = dependencies.clock.now().toISOString();
  const state: PlanningFarmWorkPackState = {
    farmId: input.farmId,
    packId: input.packId,
    isActive: input.isActive,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveFarmWorkPackState(state);
  return state;
}

async function savePackItemState(
  input: { farmId: FarmId; templateKey: string; isActive: boolean },
  existingItemStates: PlanningFarmWorkPackItemState[],
  dependencies: { clock: Clock; repository: PlanningRepository },
): Promise<PlanningFarmWorkPackItemState> {
  const existing = existingItemStates.find((state) => state.templateKey === input.templateKey);
  const now = dependencies.clock.now().toISOString();
  const state: PlanningFarmWorkPackItemState = {
    farmId: input.farmId,
    templateKey: input.templateKey,
    isActive: input.isActive,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await dependencies.repository.saveFarmWorkPackItemState(state);
  return state;
}

function isPackActive(
  packId: FarmWorkPackId,
  existingTemplateKeys: Set<string>,
  state: PlanningFarmWorkPackState | undefined,
): boolean {
  if (state) {
    return state.isActive;
  }

  const pack = FARM_WORK_PACKS.find((candidate) => candidate.id === packId);
  return Boolean(pack && collectPackTemplateKeys(pack).some((key) => existingTemplateKeys.has(key)));
}

function isPackItemActive(
  templateKey: string,
  isApplied: boolean,
  state: PlanningFarmWorkPackItemState | undefined,
): boolean {
  if (!isApplied) {
    return true;
  }

  return state?.isActive ?? true;
}

export function getFarmWorkPackIdForTemplateKey(templateKey: string | undefined): FarmWorkPackId | undefined {
  return parseFarmWorkPackTemplateKey(templateKey)?.packId;
}

export function getFarmWorkPackTemplateKindForTemplateKey(
  templateKey: string | undefined,
): "goal" | "subgoal" | "task" | undefined {
  return parseFarmWorkPackTemplateKey(templateKey)?.kind;
}

function parseFarmWorkPackTemplateKey(
  templateKey: string | undefined,
): { packId: FarmWorkPackId; kind: "goal" | "subgoal" | "task"; key: string } | undefined {
  const match = templateKey?.match(/^farmWorkPack:([^:]+):(goal|subgoal|task):(.+)$/);
  if (!match || !isFarmWorkPackId(match[1])) {
    return undefined;
  }
  return {
    packId: match[1],
    kind: match[2] as "goal" | "subgoal" | "task",
    key: match[3],
  };
}

function isFarmWorkPackId(value: string): value is FarmWorkPackId {
  return FARM_WORK_PACKS.some((pack) => pack.id === value);
}

function isDefinedString(value: string | undefined): value is string {
  return typeof value === "string";
}

function templateKey(packId: FarmWorkPackId, kind: "goal" | "subgoal" | "task", key: string): string {
  return `farmWorkPack:${packId}:${kind}:${key}`;
}
