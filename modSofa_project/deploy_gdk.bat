@echo off
echo ============================================
echo   DEPLOIEMENT MODBENCH - GDK PREVIEW
echo ============================================
echo.

set MC_PATH=%appdata%\Minecraft Bedrock Preview\users\shared\games\com.mojang

echo [1/2] Copie du Behavior Pack...
xcopy /E /I /Y "behavior_packs\modSofa_bp" "%MC_PATH%\development_behavior_packs\modSofa_bp\" >nul
if %errorlevel% neq 0 (
    echo    ❌ ERREUR lors de la copie du BP
    pause
    exit /b 1
)
echo    ✅ BP copié

echo [2/2] Copie du Resource Pack...
xcopy /E /I /Y "resource_packs\modSofa_rp" "%MC_PATH%\development_resource_packs\modSofa_rp\" >nul
if %errorlevel% neq 0 (
    echo    ❌ ERREUR lors de la copie du RP
    pause
    exit /b 1
)
echo    ✅ RP copié

echo.
echo ============================================
echo   ✅ DEPLOIEMENT TERMINE
echo ============================================
echo.
echo Prochaines étapes :
echo 1. Lance Minecraft Preview
echo 2. Crée un monde avec "Beta APIs" activé
echo 3. Active les packs dans les paramètres du monde
echo 4. Teste avec : /give @s furniture:modbench
echo.
pause
