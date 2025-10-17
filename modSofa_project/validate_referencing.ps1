# Script de validation du référencement

$errors = @()
$warnings = @()

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VALIDATION REFERENCEMENT MODBENCH" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# === 1. VERIFICATION BEHAVIOR PACK ===
Write-Host "📦 Behavior Pack..." -ForegroundColor Yellow

$bpPath = "behavior_packs\modSofa_bp\blocks\modbench.block.json"
if (Test-Path $bpPath) {
    $bp = Get-Content $bpPath | ConvertFrom-Json
    
    # Vérifie geometry
    $geometry = $bp.'minecraft:block'.components.'minecraft:geometry'
    if ($geometry -eq "geometry.modbench") {
        Write-Host "  ✅ Geometry référencée: $geometry" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Geometry incorrecte: $geometry (attendu: geometry.modbench)" -ForegroundColor Red
        $errors += "BP: Geometry reference incorrecte"
    }
    
    # Vérifie texture
    $texture = $bp.'minecraft:block'.components.'minecraft:material_instances'.'*'.texture
    if ($texture -eq "modbench") {
        Write-Host "  ✅ Texture référencée: $texture" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Texture incorrecte: $texture (attendu: modbench)" -ForegroundColor Red
        $errors += "BP: Texture reference incorrecte"
    }
} else {
    Write-Host "  ❌ FICHIER MANQUANT: $bpPath" -ForegroundColor Red
    $errors += "BP: Fichier block.json manquant"
}

# === 2. VERIFICATION GEO.JSON ===
Write-Host "`n🔷 Geometry..." -ForegroundColor Yellow

$geoPath = "resource_packs\modSofa_rp\models\blocks\modbench.geo.json"
if (Test-Path $geoPath) {
    $geo = Get-Content $geoPath | ConvertFrom-Json
    
    $geoId = $geo.'minecraft:geometry'[0].description.identifier
    if ($geoId -eq "geometry.modbench") {
        Write-Host "  ✅ Geometry définie: $geoId" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Geometry ID incorrecte: $geoId" -ForegroundColor Red
        $errors += "GEO: Identifier ne correspond pas"
    }
    
    # Vérifie dimensions
    $texW = $geo.'minecraft:geometry'[0].description.texture_width
    $texH = $geo.'minecraft:geometry'[0].description.texture_height
    Write-Host "  ℹ️  Texture dimensions: ${texW}x${texH}" -ForegroundColor Gray
} else {
    Write-Host "  ❌ FICHIER MANQUANT: $geoPath" -ForegroundColor Red
    $errors += "GEO: Fichier geometry manquant"
}

# === 3. VERIFICATION TERRAIN_TEXTURE.JSON ===
Write-Host "`n🗺️  Terrain Texture..." -ForegroundColor Yellow

$terrainPath = "resource_packs\modSofa_rp\textures\terrain_texture.json"
if (Test-Path $terrainPath) {
    $terrain = Get-Content $terrainPath | ConvertFrom-Json
    
    if ($terrain.texture_data.modbench) {
        $texPath = $terrain.texture_data.modbench.textures
        Write-Host "  ✅ Shortcut 'modbench' défini" -ForegroundColor Green
        Write-Host "  ℹ️  Chemin: $texPath" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ Shortcut 'modbench' manquant dans texture_data" -ForegroundColor Red
        $errors += "TERRAIN: Shortcut texture manquant"
    }
} else {
    Write-Host "  ❌ FICHIER MANQUANT: $terrainPath" -ForegroundColor Red
    $errors += "TERRAIN: Fichier terrain_texture.json manquant"
}

# === 4. VERIFICATION PNG ===
Write-Host "`n🎨 Fichier PNG..." -ForegroundColor Yellow

$pngPath = "resource_packs\modSofa_rp\textures\blocks\modbench.png"
if (Test-Path $pngPath) {
    Write-Host "  ✅ Fichier trouvé: modbench.png" -ForegroundColor Green
    
    try {
        Add-Type -AssemblyName System.Drawing
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $pngPath))
        
        if ($img.Width -eq 64 -and $img.Height -eq 64) {
            Write-Host "  ✅ Dimensions correctes: 64x64" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Dimensions: $($img.Width)x$($img.Height) (attendu: 64x64)" -ForegroundColor Yellow
            $warnings += "PNG: Dimensions inhabituelles"
        }
        
        $img.Dispose()
    } catch {
        Write-Host "  ⚠️  Impossible de lire les dimensions" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ FICHIER MANQUANT: $pngPath" -ForegroundColor Red
    $errors += "PNG: Fichier texture manquant"
}

# === RESUME ===
Write-Host "`n========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "  ✅ REFERENCEMENT VALIDE" -ForegroundColor Green
    Write-Host "`n  Tous les liens sont corrects !" -ForegroundColor Green
} else {
    if ($errors.Count -gt 0) {
        Write-Host "  ❌ $($errors.Count) ERREUR(S) CRITIQUE(S)" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host "     - $err" -ForegroundColor Red
        }
    }
    if ($warnings.Count -gt 0) {
        Write-Host "  ⚠️  $($warnings.Count) AVERTISSEMENT(S)" -ForegroundColor Yellow
        foreach ($warn in $warnings) {
            Write-Host "     - $warn" -ForegroundColor Yellow
        }
    }
}

Write-Host "========================================`n" -ForegroundColor Cyan
pause
