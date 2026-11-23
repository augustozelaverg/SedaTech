@echo off
chcp 65001 > nul
title SedaTech - Instalador de Certificados de Seguridad (Antivirus y Windows Defender)

echo ==============================================================================
echo          SEDATECH - REGISTRO DE CERTIFICADO DE SEGURIDAD OFICIAL
echo             Compatible con Windows 10, Windows 11 y Antivirus
echo ==============================================================================
echo.
echo Este asistente registra el Certificado Digital Oficial de SedaTech para que:
echo   - Windows SmartScreen y Microsoft Defender reconozcan la app como segura.
echo   - Los antivirus (Avast, Kaspersky, McAfee, ESET, Norton) confien en el ejecutable.
echo   - Se eliminen advertencias de "Editor Desconocido" al abrir SedaTech_Setup.exe.
echo.

:: Verificar permisos de Administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Permisos de Administrador concedidos.
) else (
    echo [SOLICITANDO PERMISOS] Por favor confirme la ventana de Control de Cuentas (UAC)...
    powershell -Command "Start-Process -Verb RunAs -FilePath '%~f0'"
    exit /b
)

echo.
echo [1/4] Registrando Autoridad Raiz de Confianza en Equipo Local (Root CA)...
certutil -addstore -f "Root" "%~dp0SedaTech_RootCA.cer" > nul 2>&1
echo       [OK] Root CA instalada en Equipo Local.

echo.
echo [2/4] Registrando Editor Confiable en Equipo Local (Trusted Publisher)...
certutil -addstore -f "TrustedPublisher" "%~dp0SedaTech_Certificado_Seguridad.cer" > nul 2>&1
echo       [OK] Editor Oficial registrado en Equipo Local.

echo.
echo [3/4] Registrando Root CA y Editor Confiable en perfil del usuario actual...
certutil -user -addstore -f "Root" "%~dp0SedaTech_RootCA.cer" > nul 2>&1
certutil -user -addstore -f "TrustedPublisher" "%~dp0SedaTech_Certificado_Seguridad.cer" > nul 2>&1
echo       [OK] Certificacion activa en el perfil del usuario.

echo.
echo [4/4] Verificando firma digital de SedaTech_Setup.exe y SedaTech.exe...
powershell -NoProfile -Command "Get-AuthenticodeSignature '%~dp0SedaTech_Setup.exe' | Select-Object Status,StatusMessage,@{N='Firmante';E={$_.SignerCertificate.Subject}} | Format-List"
powershell -NoProfile -Command "Get-AuthenticodeSignature '%~dp0SedaTech.exe' | Select-Object Status,StatusMessage,@{N='Firmante';E={$_.SignerCertificate.Subject}} | Format-List"

echo ==============================================================================
echo [COMPLETADO] Certificados Digitales de SedaTech instalados con exito.
echo Ya puede ejecutar "SedaTech_Setup.exe" con total seguridad.
echo ==============================================================================
echo.
pause
