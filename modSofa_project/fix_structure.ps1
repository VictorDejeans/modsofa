# Migration automatique de la structure

Write-Host "`n🔧 Correction de la structure...`n" -ForegroundColor Cyan

$rpPath = "resource_packs\modSofa_rp"

# 1. Déplace le .geo.json s'il est mal placé
$wrongPath = "$rpPath\blocks\modbench.geo.json"
$correctPath = "$rpPath\models\blocks\modbench.geo.json"

if (Test-Path $wrongPath) {
    Write-Host "  📦 Déplacement de modbench.geo.json..." -ForegroundColor Yellow
    
    # Crée le dossier si nécessaire
    New-Item -ItemType Directory -Path "$rpPath\models\blocks" -Force | Out-Null
    
    # Déplace le fichier
    Move-Item -Path $wrongPath -Destination $correctPath -Force
    Write-Host "  ✅ Fichier déplacé vers models/blocks/" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  modbench.geo.json déjà au bon endroit" -ForegroundColor Gray
}

# 2. Crée blocks/modbench.json s'il n'existe pas
$blocksConfig = "$rpPath\blocks\modbench.json"

if (-not (Test-Path $blocksConfig)) {
    Write-Host "  📝 Création de blocks/modbench.json..." -ForegroundColor Yellow
    
    $content = @"
{
  "format_version": "1.20.60",
  "minecraft:block": {
    "description": {
      "identifier": "furniture:modbench"
    },
    "components": {
      "minecraft:destroy_time": 1.5,
      "minecraft:block_sound": "wood",
      "minecraft:block_light_emission": 0
    }
  }
}
"@
    
    New-Item -ItemType Directory -Path "$rpPath\blocks" -Force | Out-Null
    Set-Content -Path $blocksConfig -Value $content
    Write-Host "  ✅ Fichier de configuration créé" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  blocks/modbench.json existe déjà" -ForegroundColor Gray
}

Write-Host "`n✅ Migration terminée !`n" -ForegroundColor Green
pause
