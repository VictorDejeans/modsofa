const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔑 Génération des UUIDs pour modSofa...\n');

// Générer 4 UUIDs uniques
const uuids = {
  bp_header: randomUUID(),
  bp_module: randomUUID(),
  rp_header: randomUUID(),
  rp_module: randomUUID()
};

// Afficher les UUIDs
console.log('Behavior Pack:');
console.log(`  Header: ${uuids.bp_header}`);
console.log(`  Module: ${uuids.bp_module}\n`);

console.log('Resource Pack:');
console.log(`  Header: ${uuids.rp_header}`);
console.log(`  Module: ${uuids.rp_module}\n`);

// Sauvegarder dans un fichier JSON pour référence
const uuidFile = path.join(__dirname, 'project_uuids.json');
fs.writeFileSync(uuidFile, JSON.stringify(uuids, null, 2));

console.log(`✅ UUIDs sauvegardés dans: ${uuidFile}\n`);

// Créer les manifests avec les UUIDs
const bpManifest = {
  format_version: 2,
  header: {
    name: "modSofa Behavior",
    description: "Sofas modulaires avec connexions automatiques",
    uuid: uuids.bp_header,
    version: [1, 0, 0],
    min_engine_version: [1, 20, 50]
  },
  modules: [
    {
      type: "data",
      uuid: uuids.bp_module,
      version: [1, 0, 0]
    },
    {
      type: "script",
      language: "javascript",
      uuid: randomUUID(),
      version: [1, 0, 0],
      entry: "scripts/main.js"
    }
  ],
  dependencies: [
    {
      uuid: uuids.rp_header,
      version: [1, 0, 0]
    },
    {
      module_name: "@minecraft/server",
      version: "1.8.0-beta"
    }
  ]
};

const rpManifest = {
  format_version: 2,
  header: {
    name: "modSofa Resources",
    description: "Modèles et textures pour sofas modulaires",
    uuid: uuids.rp_header,
    version: [1, 0, 0],
    min_engine_version: [1, 20, 50]
  },
  modules: [
    {
      type: "resources",
      uuid: uuids.rp_module,
      version: [1, 0, 0]
    }
  ]
};

// Sauvegarder les manifests
const bpManifestPath = path.join(__dirname, 'behavior_packs', 'modSofa_bp', 'manifest.json');
const rpManifestPath = path.join(__dirname, 'resource_packs', 'modSofa_rp', 'manifest.json');

fs.writeFileSync(bpManifestPath, JSON.stringify(bpManifest, null, 2));
fs.writeFileSync(rpManifestPath, JSON.stringify(rpManifest, null, 2));

console.log('📄 Manifests créés:');
console.log(`   ${bpManifestPath}`);
console.log(`   ${rpManifestPath}\n`);

console.log('✨ Configuration terminée!\n');
console.log('🎯 Prochaine étape: Créer les fichiers de configuration des blocs');
