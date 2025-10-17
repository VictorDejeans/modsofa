// Module de gestion des connexions modulaires/**
 /* ========================================
 * MODULAR BENCH CONNECTOR SYSTEM
 * ========================================
 * 
 * Ce script gère la connexion automatique des bancs modulaires.
 * Il détecte les bancs adjacents et change leur apparence (left/chair/right/standalone)
 * en fonction de leur position dans la configuration.
 * 
 * Fonctionnalités :
 * - Connexion automatique à la pose
 * - Mise à jour des voisins
 * - Gestion de la destruction
 * - Respect de la direction du joueur
 */

import { world, system, BlockPermutation } from "@minecraft/server";

// ========================================
// ENREGISTREMENT DU CUSTOM COMPONENT
// ========================================

/**
 * CRITIQUE : Ce bloc enregistre le custom component déclaré dans le JSON.
 * Sans cela, Minecraft affiche une erreur car le component "furniture:bench_connector"
 * est déclaré dans modbench.block.json mais n'existe pas dans le code.
 */
world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.blockComponentRegistry.registerCustomComponent(
    'furniture:bench_connector', // ← Doit correspondre au JSON
    {
      /**
       * Appelé quand le bloc est placé par un joueur
       * @param {BlockComponentPlayerPlaceBeforeEvent} event
       */
      onPlace(event) {
        const block = event.block;
        
        // Attendre 1 tick pour que le bloc soit complètement initialisé
        // (sinon les permutations peuvent échouer)
        system.runTimeout(() => {
          updateBenchModule(block);
          updateNeighborBenches(block);
        }, 1);
      },

      /**
       * Appelé quand le bloc est détruit
       * @param {BlockComponentPlayerDestroyEvent} event
       */
      onPlayerDestroy(event) {
        const location = event.block.location;
        const dimension = event.dimension;
        
        // Après destruction, mettre à jour les bancs voisins
        // (sinon ils gardent leur ancien state et l'apparence est cassée)
        system.runTimeout(() => {
          updateNeighborsAtLocation(dimension, location);
        }, 1);
      }
    }
  );

  console.warn("✅ [ModSofa] Bench connector component registered successfully!");
});

// ========================================
// LOGIQUE DE CONNEXION PRINCIPALE
// ========================================

/**
 * Met à jour le state "bench:module" d'un banc en fonction de ses voisins
 * @param {Block} block - Le banc à mettre à jour
 */
function updateBenchModule(block) {
  // Vérifier que c'est bien un banc
  if (!block || block.typeId !== "furniture:modbench") return;

  // Récupérer la direction du bloc (north/south/east/west)
  const facing = block.permutation.getState('minecraft:cardinal_direction');
  
  // Obtenir les 2 blocs sur l'axe perpendiculaire (left/right relatifs)
  const leftBlock = getRelativeBlock(block, facing, 'left');
  const rightBlock = getRelativeBlock(block, facing, 'right');
  
  // Vérifier si ce sont des bancs
  const hasLeft = leftBlock?.typeId === "furniture:modbench";
  const hasRight = rightBlock?.typeId === "furniture:modbench";
  
  /**
   * LOGIQUE DE DÉTERMINATION DU MODULE :
   * 
   * standalone : aucun voisin
   * left       : voisin à droite uniquement (extrémité gauche du canapé)
   * chair      : voisins des deux côtés (milieu du canapé)
   * right      : voisin à gauche uniquement (extrémité droite du canapé)
   */
  let moduleState;
  if (!hasLeft && !hasRight) {
    moduleState = 'standalone';
  } else if (hasLeft && hasRight) {
    moduleState = 'chair';
  } else if (hasRight) {
    moduleState = 'left';
  } else {
    moduleState = 'right';
  }
  
  try {
    // Créer une nouvelle permutation avec le state mis à jour
    const newPermutation = BlockPermutation.resolve(
      block.typeId,
      {
        'minecraft:cardinal_direction': facing, // Garder l'orientation
        'bench:module': moduleState              // Nouveau module
      }
    );
    
    // Appliquer la permutation au bloc
    block.setPermutation(newPermutation);
    
    console.warn(`🔄 [ModSofa] Block at (${block.location.x}, ${block.location.y}, ${block.location.z}) → ${moduleState}`);
  } catch (error) {
    console.error(`❌ [ModSofa] Failed to update bench: ${error}`);
  }
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Obtient le bloc adjacent dans une direction relative au facing du bloc
 * 
 * Exemple : Si le banc regarde NORD et qu'on demande 'left'
 *          → On cherche le bloc à l'OUEST
 * 
 * @param {Block} block - Le banc de référence
 * @param {string} facing - Direction cardinale (north/south/east/west)
 * @param {string} side - 'left' ou 'right' (relatif au facing)
 * @returns {Block|undefined}
 */
function getRelativeBlock(block, facing, side) {
  /**
   * TABLE DE CORRESPONDANCE :
   * 
   * Si facing = NORTH:
   *   - left  → WEST  (x-1)
   *   - right → EAST  (x+1)
   * 
   * Si facing = SOUTH:
   *   - left  → EAST  (x+1)
   *   - right → WEST  (x-1)
   * 
   * Si facing = EAST:
   *   - left  → NORTH (z-1)
   *   - right → SOUTH (z+1)
   * 
   * Si facing = WEST:
   *   - left  → SOUTH (z+1)
   *   - right → NORTH (z-1)
   */
  const offsets = {
    north: { left: { x: -1, z: 0 }, right: { x: 1, z: 0 } },
    south: { left: { x: 1, z: 0 }, right: { x: -1, z: 0 } },
    east:  { left: { x: 0, z: -1 }, right: { x: 0, z: 1 } },
    west:  { left: { x: 0, z: 1 }, right: { x: 0, z: -1 } }
  };
  
  const offset = offsets[facing]?.[side];
  if (!offset) return undefined;
  
  try {
    return block.dimension.getBlock({
      x: block.location.x + offset.x,
      y: block.location.y,
      z: block.location.z + offset.z
    });
  } catch (error) {
    return undefined;
  }
}

/**
 * Met à jour tous les bancs voisins d'un bloc donné
 * @param {Block} block - Le banc qui vient d'être placé
 */
function updateNeighborBenches(block) {
  const facing = block.permutation.getState('minecraft:cardinal_direction');
  
  // Ne mettre à jour QUE les bancs sur l'axe perpendiculaire
  // (pas les 4 directions → évite les connexions indésirables)
  const leftBlock = getRelativeBlock(block, facing, 'left');
  const rightBlock = getRelativeBlock(block, facing, 'right');
  
  [leftBlock, rightBlock].forEach(neighbor => {
    if (neighbor?.typeId === "furniture:modbench") {
      updateBenchModule(neighbor);
    }
  });
}

/**
 * Met à jour les bancs voisins d'une position donnée (utilisé après destruction)
 * @param {Dimension} dimension
 * @param {Vector3} location
 */
function updateNeighborsAtLocation(dimension, location) {
  // Vérifier les 4 directions (on ne connaît pas le facing du bloc détruit)
  const offsets = [
    { x: 1, z: 0 },
    { x: -1, z: 0 },
    { x: 0, z: 1 },
    { x: 0, z: -1 }
  ];
  
  offsets.forEach(offset => {
    try {
      const neighbor = dimension.getBlock({
        x: location.x + offset.x,
        y: location.y,
        z: location.z + offset.z
      });
      
      if (neighbor?.typeId === "furniture:modbench") {
        updateBenchModule(neighbor);
      }
    } catch (error) {
      // Bloc hors du monde chargé, ignoré
    }
  });
}

// ========================================
// EVENT LISTENER GLOBAL (BACKUP)
// ========================================

/**
 * Fallback pour les versions de Minecraft qui n'ont pas le support complet
 * des custom components. Garde ton ancien système comme backup.
 */
world.afterEvents.playerPlaceBlock.subscribe(event => {
  const block = event.block;
  if (block.typeId !== "furniture:modbench") return;
  
  // Note : Ce code ne devrait jamais s'exécuter si le custom component fonctionne
  console.warn("⚠️ [ModSofa] Fallback event triggered (custom component may not be working)");
  
  system.runTimeout(() => {
    updateBenchModule(block);
    updateNeighborBenches(block);
  }, 1);
});
