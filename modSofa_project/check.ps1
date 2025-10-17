Write-Host "=== VERIFICATION FICHIERS ===" -ForegroundColor Cyan
Write-Host ""

$bp = "behavior_packs\modSofa_bp\blocks\modbench.block.json"
$geo = "resource_packs\modSofa_rp\models\blocks\modbench.geo.json"
$terrain = "resource_packs\modSofa_rp\textures\terrain_texture.json"
$png = "resource_packs\modSofa_rp\textures\blocks\modbench.png"

if (Test-Path $bp) {
    Write-Host "[OK] BP trouve" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] BP manquant" -ForegroundColor Red
}

if (Test-Path $geo) {
    Write-Host "[OK] GEO trouve" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] GEO manquant" -ForegroundColor Red
}

if (Test-Path $terrain) {
    Write-Host "[OK] TERRAIN trouve" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] TERRAIN manquant" -ForegroundColor Red
}

if (Test-Path $png) {
    Write-Host "[OK] PNG trouve" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] PNG manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== VERIFICATION CONTENU ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $bp) {
    $content = Get-Content $bp -Raw
    if ($content -match '"minecraft:geometry":\s*"geometry\.modbench"') {
        Write-Host "[OK] Geometry reference correcte" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Geometry reference incorrecte" -ForegroundColor Red
    }
    
    if ($content -match '"texture":\s*"modbench"') {
        Write-Host "[OK] Texture reference correcte" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Texture reference incorrecte" -ForegroundColor Red
    }
}

if (Test-Path $geo) {
    $content = Get-Content $geo -Raw
    if ($content -match '"identifier":\s*"geometry\.modbench"') {
        Write-Host "[OK] Geometry identifier correct" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Geometry identifier incorrect" -ForegroundColor Red
    }
}

if (Test-Path $terrain) {
    $content = Get-Content $terrain -Raw
    if ($content -match '"modbench"') {
        Write-Host "[OK] Shortcut modbench trouve" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Shortcut modbench manquant" -ForegroundColor Red
    }
}

Write-Host ""
pause
