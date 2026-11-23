@echo off
chcp 65001 > nul
title SedaTech - Servidor Local Seguro

echo ==============================================================================
echo             SEDATECH · SISTEMA DE GESTION DE TICKETS
echo                   MODO SERVIDOR LOCAL OFFLINE DIRECTO
echo ==============================================================================
echo.

set PORT=4200
set APP_DIR=%~dp0app

if not exist "%APP_DIR%\index.html" (
    echo [ERROR] No se encuentra la carpeta "app" en: %APP_DIR%
    pause
    exit /b
)

echo Iniciando servidor HTTP local seguro en el puerto %PORT%...
echo Carpeta origen: %APP_DIR%
echo.

:: Detectar navegador Microsoft Edge o Google Chrome
set BROWSER_CMD=""
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER_CMD="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:%PORT% --window-size=1366,768
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER_CMD="%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:%PORT% --window-size=1366,768
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set BROWSER_CMD="%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:%PORT% --window-size=1366,768
) else (
    set BROWSER_CMD=start http://localhost:%PORT%
)

:: Lanzar servidor HTTP local en segundo plano usando PowerShell
start /b powershell -NoProfile -ExecutionPolicy Bypass -Command "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:%PORT%/'); $listener.Start(); Write-Host 'Servidor activo en http://localhost:%PORT%/'; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $url = [System.Uri]::UnescapeDataString($request.Url.LocalPath.TrimStart('/')); if ([string]::IsNullOrEmpty($url) -or $url -eq '/') { $url = 'index.html' }; $filePath = Join-Path '%APP_DIR%' $url; if (-not (Test-Path $filePath)) { $filePath = Join-Path '%APP_DIR%' 'index.html' }; try { $bytes = [System.IO.File]::ReadAllBytes($filePath); $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); switch ($ext) { '.html' { $response.ContentType = 'text/html; charset=utf-8' } '.js' { $response.ContentType = 'application/javascript; charset=utf-8' } '.css' { $response.ContentType = 'text/css; charset=utf-8' } '.png' { $response.ContentType = 'image/png' } '.jpg' { $response.ContentType = 'image/jpeg' } '.svg' { $response.ContentType = 'image/svg+xml' } default { $response.ContentType = 'application/octet-stream' } }; $response.ContentLength64 = $bytes.Length; $response.OutputStream.Write($bytes, 0, $bytes.Length) } catch { $response.StatusCode = 500 } finally { $response.OutputStream.Close() } }"

timeout /t 2 > nul
echo.
echo [OK] Abriendo ventana nativa de SedaTech...
%BROWSER_CMD%

echo.
echo ------------------------------------------------------------------------------
echo SedaTech esta en ejecucion. Mantenga esta ventana abierta mientras use la app.
echo Para cerrar el servidor, presione Ctrl + C o cierre esta consola.
echo ------------------------------------------------------------------------------
echo.
pause
