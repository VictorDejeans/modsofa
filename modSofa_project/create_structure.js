const fs = require('fs');
const path = require('path');

// Configuration du projet
const projectName = 'modSofa';
const namespace = 'furniture';

// Structure complète des dossiers et fichiers
const structure = {
  'behavior_packs': {
    [`${projectName}_bp`]: {
      'blocks': {},
      'scripts': {
        'modules': {}
      },
      'texts': {}
    }
  },
  'resource_packs': {
    [`${projectName}_rp`]: {
      'blocks': {},        // ← Ajouté : config visuelle par bloc
      'texts': {},
      'textures': {
        'blocks': {}
      },
      'models': {
        'blocks': {}
      }
    }
  }
};

// Fonction récursive pour créer l'arborescence
function createStructure(basePath, structure) {
  Object.keys(structure).forEach(name => {
    const fullPath = path.join(basePath, name);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Créé: ${fullPath}`);
    }
    
    if (Object.keys(structure[name]).length > 0) {
      createStructure(fullPath, structure[name]);
    }
  });
}

// Fonction pour créer un fichier vide avec un commentaire
function createPlaceholderFile(filePath, comment) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, comment);
    console.log(`📄 Créé: ${filePath}`);
  }
}

// EXÉCUTION
console.log('🚀 Création de la structure du projet modSofa...\n');

// 1. Créer l'arborescence de dossiers
createStructure(__dirname, structure);

// 2. Créer les fichiers placeholder essentiels
const bpPath = path.join(__dirname, 'behavior_packs', `${projectName}_bp`);
const rpPath = path.join(__dirname, 'resource_packs', `${projectName}_rp`);

// Manifests
createPlaceholderFile(
  path.join(bpPath, 'manifest.json'),
  '// Behavior Pack manifest - à compléter'
);

createPlaceholderFile(
  path.join(rpPath, 'manifest.json'),
  '// Resource Pack manifest - à compléter'
);

// Scripts
createPlaceholderFile(
  path.join(bpPath, 'scripts', 'main.js'),
  '// Script principal - logique de connexion des sofas'
);

createPlaceholderFile(
  path.join(bpPath, 'scripts', 'modules', 'connection_handler.js'),
  '// Module de gestion des connexions modulaires'
);

// Blocks - Behavior Pack
createPlaceholderFile(
  path.join(bpPath, 'blocks', 'mod_sofa.json'),
  '// Définition du bloc modulaire sofa (logique + états)'
);

// Blocks - Resource Pack (config visuelle)
createPlaceholderFile(
  path.join(rpPath, 'blocks', 'mod_sofa.json'),
  '// Configuration visuelle du bloc (son, particules)'
);

// Terrain texture (atlas)
createPlaceholderFile(
  path.join(rpPath, 'textures', 'terrain_texture.json'),
  '// Atlas des textures de blocs'
);

// Langues
createPlaceholderFile(
  path.join(bpPath, 'texts', 'en_US.lang'),
  '## Traductions anglaises\ntile.furniture:mod_sofa.name=Modular Sofa'
);

createPlaceholderFile(
  path.join(bpPath, 'texts', 'languages.json'),
  '["en_US"]'
);

createPlaceholderFile(
  path.join(rpPath, 'texts', 'en_US.lang'),
  '## Traductions anglaises\ntile.furniture:mod_sofa.name=Modular Sofa'
);

createPlaceholderFile(
  path.join(rpPath, 'texts', 'languages.json'),
  '["en_US"]'
);

// Pack icons placeholders
createPlaceholderFile(
  path.join(bpPath, 'pack_icon_info.txt'),
  'Placer ici : pack_icon.png (128x128 ou 256x256)'
);

createPlaceholderFile(
  path.join(rpPath, 'pack_icon_info.txt'),
  'Placer ici : pack_icon.png (128x128 ou 256x256)'
);

// Fichier README
createPlaceholderFile(
  path.join(__dirname, 'README.md'),
  `# ${projectName} - Minecraft Bedrock Addon\n\nSofas modulaires avec connexions automatiques.\n\n## Structure\n- behavior_packs/ : Logique et scripts\n- resource_packs/ : Modèles et textures\n\n## Architecture\n- 1 bloc avec 3 bones (left, middle, right)\n- 4 états de connexion gérés par script\n- Détection automatique des voisins selon orientation`
);

console.log('\n✨ Structure créée avec succès!\n');
console.log('📁 Architecture moderne avec:');
console.log('   - blocks/ dans BP (logique)');
console.log('   - blocks/ dans RP (visuel)');
console.log('   - terrain_texture.json (atlas)\n');
console.log('🎯 Prochaines étapes:');
console.log('1. Générer les UUIDs pour les manifests');
console.log('2. Remplir les fichiers de configuration');
console.log('3. Créer le modèle 3D dans Blockbench');
