// scripts/modules/bench_connector.js
import { system, world } from "@minecraft/server";

// CONFIG
const MOD_ID = "furniture:modbench";
const MODULE_STATE = "furniture:module";
const FACING_STATE = "minecraft:cardinal_direction";

// Idempotency guard
let _registered = false;
let _handles = [];

// Toggle for minimal debug lines
const DEBUG = false;
const log = (...a) => { if (DEBUG) try { console.warn("[ModSofa][debug]", ...a); } catch {} };

// Run next tick on all supported builds
function runNextTick(fn) {
  if (typeof system.runTimeout === "function") return system.runTimeout(fn, 1);
  return system.run(fn);
}

// Helpers
function isFiniteVec(v) {
  return v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}
function toBlockLoc(v) {
  return { x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z) };
}
function safeGetBlock(dim, pos) {
  try { return dim.getBlock(pos); } catch { return undefined; }
}
function getFacing(block) {
  const perm = block.permutation;
  return perm.getState?.(FACING_STATE) ?? perm.getProperty?.(FACING_STATE);
}
function setModule(block, kind) {
  const perm = block.permutation;
  const next = perm.withState?.(MODULE_STATE, kind) ?? perm.withProperty?.(MODULE_STATE, kind);
  if (next) block.setPermutation(next);
}
function neighbor(dim, loc, dx, dz) {
  return safeGetBlock(dim, { x: loc.x + dx, y: loc.y, z: loc.z + dz });
}
function getLeftRight(block) {
  const dim = block.dimension;
  const loc = block.location;
  const facing = getFacing(block);
  let L = { dx: 0, dz: 0 }, R = { dx: 0, dz: 0 };
  switch (facing) {
    case "north": L = { dx: -1, dz: 0 }; R = { dx: 1, dz: 0 }; break;
    case "south": L = { dx: 1, dz: 0 };  R = { dx: -1, dz: 0 }; break;
    case "east":  L = { dx: 0, dz: -1 }; R = { dx: 0, dz: 1 };  break;
    case "west":  L = { dx: 0, dz: 1 };  R = { dx: 0, dz: -1 }; break;
    default: break;
  }
  const leftB = neighbor(dim, loc, L.dx, L.dz);
  const rightB = neighbor(dim, loc, R.dx, R.dz);
  return { leftB, rightB };
}
function updateBenchModule(block) {
  if (!block || block.typeId !== MOD_ID) return;
  const { leftB, rightB } = getLeftRight(block);
  const hasL = leftB?.typeId === MOD_ID;
  const hasR = rightB?.typeId === MOD_ID;
  let moduleKind = "standalone";
  if (hasL && hasR) moduleKind = "chair";
  else if (hasL && !hasR) moduleKind = "right";
  else if (!hasL && hasR) moduleKind = "left";
  setModule(block, moduleKind);
}
function forEachOrthogonalNeighbor(dim, loc, cb) {
  const offs = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
  ];
  for (const o of offs) {
    const b = safeGetBlock(dim, { x: loc.x + o.x, y: loc.y + o.y, z: loc.z + o.z });
    if (b) cb(b);
  }
}
function updateNeighborsAt(dim, loc) {
  forEachOrthogonalNeighbor(dim, loc, (b) => {
    if (b.typeId === MOD_ID) updateBenchModule(b);
  });
}

// Location extractors (covering multiple Preview variants)
function extractPlaceLoc(e) {
  const dim = e.block?.dimension ?? e.dimension ?? e.source?.dimension;
  const src =
    e.block?.location ??
    e.blockLocation ??
    e.placedBlock?.location ??
    e.placedBlockLocation ??
    e.location;
  if (!dim || !isFiniteVec(src)) return { dim: undefined, loc: undefined };
  return { dim, loc: toBlockLoc(src) };
}
function extractBreakLocBefore(e) {
  const dim = e.block?.dimension ?? e.dimension ?? e.source?.dimension;
  const src = e.block?.location ?? e.blockLocation ?? e.location;
  if (!dim || !isFiniteVec(src)) return { dim: undefined, loc: undefined };
  return { dim, loc: toBlockLoc(src) };
}
function extractBreakLocAfter(e) {
  const dim = e.block?.dimension ?? e.dimension ?? e.source?.dimension;
  const src =
    e.block?.location ??
    e.blockLocation ??
    e.destroyedBlockLocation ??   // some builds
    e.brokenBlockLocation ??      // other builds
    e.location;
  if (!dim || !isFiniteVec(src)) return { dim: undefined, loc: undefined };
  return { dim, loc: toBlockLoc(src) };
}

// Public API
export function registerBenchConnector() {
  if (_registered) return () => {}; // already active
  _registered = true;

  // PLACE
  const placeEvt = world.afterEvents?.playerPlaceBlock ?? world.afterEvents?.blockPlace;
  if (placeEvt?.subscribe) {
    const h1 = placeEvt.subscribe((e) => {
      const { dim, loc } = extractPlaceLoc(e);
      if (!dim || !loc) return;
      runNextTick(() => {
        const placed = safeGetBlock(dim, loc);
        if (placed?.typeId === MOD_ID) updateBenchModule(placed);
        updateNeighborsAt(dim, loc);
      });
    });
    _handles.push({ evt: placeEvt, h: h1 });
  }

  // BREAK — prefer BEFORE, fallback to AFTER
  let breakSubscribed = false;

  const breakBeforeEvt = world.beforeEvents?.playerBreakBlock ?? world.beforeEvents?.blockBreak;
  if (breakBeforeEvt?.subscribe) {
    const hB = breakBeforeEvt.subscribe((e) => {
      const { dim, loc } = extractBreakLocBefore(e);
      if (!dim || !loc) return;
      log("break BEFORE", loc);
      runNextTick(() => updateNeighborsAt(dim, loc));
    });
    _handles.push({ evt: breakBeforeEvt, h: hB });
    breakSubscribed = true;
  }

  if (!breakSubscribed) {
    const breakAfterEvt =
      world.afterEvents?.playerBreakBlock ??
      world.afterEvents?.blockBreak ??
      world.afterEvents?.playerDestroyBlock;
    if (breakAfterEvt?.subscribe) {
      const hA = breakAfterEvt.subscribe((e) => {
        const { dim, loc } = extractBreakLocAfter(e);
        if (!dim || !loc) return;
        log("break AFTER", loc);
        runNextTick(() => updateNeighborsAt(dim, loc));
      });
      _handles.push({ evt: breakAfterEvt, h: hA });
      breakSubscribed = true;
    }
  }

  if (!breakSubscribed) {
    console.warn("⚠️ [ModSofa] No break event available on this build — benches won’t auto‑update on break.");
  }

  // Cleanup
  return function unregisterBenchConnector() {
    for (const { evt, h } of _handles) {
      try { evt.unsubscribe?.(h); } catch {}
    }
    _handles = [];
    _registered = false;
  };
}

// Optional shim so your main.js can keep calling it
export function enableBenchFallback() {
  return registerBenchConnector();
}
