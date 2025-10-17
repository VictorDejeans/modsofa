# Vérification de la structure des fichiers

$errors = @()

# Fichiers requis
$requiredFiles = @(
    "behavior_packs\modSofa_bp\blocks\modbench.block.json",
    "behavior_packs\modSofa_bp\scripts\main.js",
    "behavior_packs\modSofa_bp\scripts\modules\bench_connector.js",
    "resource_packs\modSofa_rp\blocks\modbench.json",
    "resource_packs\modSofa_rp\models\blocks\modbench.geo.json",
    "resource_packs\modSofa_rp\textures\terrain_texture.json",
    "resource_packs\modSofa_rp\textures\blocks\modbench.png"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION STRUCTURE MODBENCH" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MANQUANT" -ForegroundColor Red
        $errors += $file
    }
}

# Vérification fichier mal placé
if (Test-Path "resource_packs\modSofa_rp\blocks\modbench.geo.json") {
    Write-Host "`n  ⚠️  ATTENTION: modbench.geo.json est dans blocks/ au lieu de models/blocks/" -ForegroundColor Yellow
    $errors += "Fichier .geo.json mal placé"
}

Write-Host "`n========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "  ✅ STRUCTURE VALIDE" -ForegroundColor Green
} else {
    Write-Host "  ❌ $($errors.Count) ERREUR(S) DETECTEE(S)" -ForegroundColor Red
}

Write-Host "========================================`n" -ForegroundColor Cyan

pause
