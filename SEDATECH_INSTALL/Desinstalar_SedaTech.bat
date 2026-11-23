@echo off
chcp 65001 > nul
title Desinstalar SedaTech - Sistema de Gestion de Tickets

echo ==============================================================================
echo          DESINSTALADOR OFICIAL DE SEDATECH - GESTION DE TICKETS
echo ==============================================================================
echo.

set TARGET_DIR=%LOCALAPPDATA%\Programs\SedaTech
set DESKTOP_LINK=%USERPROFILE%\Desktop\SedaTech.lnk
set STARTMENU_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\SedaTech

if exist "%TARGET_DIR%\Uninstall.exe" (
    echo Ejecutando desinstalador oficial...
    start /wait "" "%TARGET_DIR%\Uninstall.exe"
    exit /b
)

echo Eliminando accesos directos...
if exist "%DESKTOP_LINK%" del /f /q "%DESKTOP_LINK%" >nul 2>&1
if exist "%STARTMENU_DIR%" rmdir /s /q "%STARTMENU_DIR%" >nul 2>&1

echo Eliminando archivos instalados...
if exist "%TARGET_DIR%" (
    rmdir /s /q "%TARGET_DIR%" >nul 2>&1
    echo [OK] Programa desinstalado correctamente.
) else (
    echo [INFO] No se encontro instalacion fija en %TARGET_DIR%.
)

echo.
echo Desinstalacion completada limpiamente.
pause
