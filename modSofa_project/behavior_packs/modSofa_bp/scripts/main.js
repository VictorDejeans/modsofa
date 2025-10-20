// behavior_packs/modSofa_bp/scripts/main.js
import { world } from "@minecraft/server";
import { registerBenchConnector, enableBenchFallback } from "./modules/bench_connector.js";

// Register once on startup (idempotent)
const unregisterBenchConnector = registerBenchConnector();

// If the API offers a worldInitialize we don’t need anything extra for benches,
// but leave this in case you later add custom block components.
const hasBefore = !!world.beforeEvents?.worldInitialize;
const hasLegacy = !!world.events?.worldInitialize;

if (hasBefore) {
  world.beforeEvents.worldInitialize.subscribe((_ev) => {
    registerBenchConnector();
  });
} else if (hasLegacy) {
  world.events.worldInitialize.subscribe((_ev) => {
    registerBenchConnector();
  });
} else {
  console.warn("❌ [ModSofa] worldInitialize introuvable. Fallback events only.");
}

// Always enable the safe fallback listeners so the block still works
enableBenchFallback();
