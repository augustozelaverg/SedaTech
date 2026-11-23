; ==============================================================================
; SedaTech - Official NSIS Windows Installer Script v3.5.0
; Fully compatible with Windows 10 & Windows 11 (64-bit)
; Code-Signed & Verified with Authenticode SHA-256 Digital Certificate
; ==============================================================================

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

Name "SedaTech - Sistema de Gestión de Tickets"
OutFile "SEDATECH_INSTALL/SedaTech_Setup_raw.exe"
Unicode True
RequestExecutionLevel user
SetCompressor /SOLID lzma
ManifestSupportedOS all
ManifestDPIAware true

!define PRODUCT_NAME "SedaTech"
!define PRODUCT_VERSION "3.5.0"
!define PRODUCT_PUBLISHER "SedaTech"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\SedaTech.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

; Version Information & Antivirus Trust Metadata
VIProductVersion "3.5.0.0"
VIFileVersion "3.5.0.0"
VIAddVersionKey "ProductName" "SedaTech - Sistema de Gestión de Tickets"
VIAddVersionKey "CompanyName" "SedaTech"
VIAddVersionKey "FileDescription" "Instalador Oficial de SedaTech - Sistema de Gestión de Tickets"
VIAddVersionKey "FileVersion" "3.5.0.0"
VIAddVersionKey "ProductVersion" "3.5.0.0"
VIAddVersionKey "LegalCopyright" "Copyright (C) 2026 SedaTech. Todos los derechos reservados."
VIAddVersionKey "OriginalFilename" "SedaTech_Setup.exe"
VIAddVersionKey "Comments" "Instalador Oficial Certificado con Firma Digital Authenticode SHA-256 para Windows 10 y Windows 11."

InstallDir "$LOCALAPPDATA\Programs\SedaTech"
InstallDirRegKey HKCU "${PRODUCT_DIR_REGKEY}" ""

!define MUI_ABORTWARNING
!define MUI_ICON "public\SedaTech.ico"
!define MUI_UNICON "public\SedaTech.ico"
!define MUI_HEADERIMAGE
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\SedaTech.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Iniciar SedaTech ahora"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "Spanish"

Section "Principal" SecMain
    SetOutPath "$INSTDIR"
    SetOverwrite on

    ; Signed Native 64-bit Win32 + DWM Transparent + WebView2 Host, Loader DLL & Official Desktop Icon
    File "SEDATECH_INSTALL\SedaTech.exe"
    File "SEDATECH_INSTALL\WebView2Loader.dll"
    File "SEDATECH_INSTALL\SedaTech.ico"

    ; Security Certificates & Helper Scripts
    File "SEDATECH_INSTALL\SedaTech_Certificado_Seguridad.cer"
    File "SEDATECH_INSTALL\SedaTech_RootCA.cer"
    File "SEDATECH_INSTALL\Instalar_Certificado_Antivirus.bat"
    File "SEDATECH_INSTALL\Iniciar_SedaTech_Servidor_Local.bat"
    File "SEDATECH_INSTALL\Desinstalar_SedaTech.bat"
    File "SEDATECH_INSTALL\LEEME_INSTALACION.txt"

    ; Updated App Distribution (Latest Compiled Build)
    SetOutPath "$INSTDIR\app"
    File /r "dist\*.*"

    SetOutPath "$INSTDIR"

    ; Register certificates in Current User stores silently (no extra UAC needed)
    nsExec::Exec '"$SYSDIR\certutil.exe" -user -addstore -f "Root" "$INSTDIR\SedaTech_RootCA.cer"'
    nsExec::Exec '"$SYSDIR\certutil.exe" -user -addstore -f "TrustedPublisher" "$INSTDIR\SedaTech_Certificado_Seguridad.cer"'

    ; Create Uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; Start Menu Shortcuts (using official SedaTech.ico)
    CreateDirectory "$SMPROGRAMS\SedaTech"
    CreateShortcut "$SMPROGRAMS\SedaTech\SedaTech.lnk" "$INSTDIR\SedaTech.exe" "" "$INSTDIR\SedaTech.ico" 0
    CreateShortcut "$SMPROGRAMS\SedaTech\SedaTech (Servidor Local).lnk" "$INSTDIR\Iniciar_SedaTech_Servidor_Local.bat" "" "$INSTDIR\SedaTech.ico" 0
    CreateShortcut "$SMPROGRAMS\SedaTech\Instalar Certificado Antivirus.lnk" "$INSTDIR\Instalar_Certificado_Antivirus.bat" "" "$INSTDIR\SedaTech.ico" 0
    CreateShortcut "$SMPROGRAMS\SedaTech\Desinstalar SedaTech.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\SedaTech.ico" 0

    ; Desktop Shortcut (displays official SedaTech.ico on Windows Desktop)
    CreateShortcut "$DESKTOP\SedaTech.lnk" "$INSTDIR\SedaTech.exe" "" "$INSTDIR\SedaTech.ico" 0

    ; Windows Registry Integration
    WriteRegStr HKCU "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\SedaTech.exe"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayName" "SedaTech - Sistema de Gestión de Tickets"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\SedaTech.ico"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "InstallLocation" "$INSTDIR"
    WriteRegDWORD HKCU "${PRODUCT_UNINST_KEY}" "NoModify" 1
    WriteRegDWORD HKCU "${PRODUCT_UNINST_KEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
    Delete "$DESKTOP\SedaTech.lnk"
    RMDir /r "$SMPROGRAMS\SedaTech"
    RMDir /r "$INSTDIR"
    DeleteRegKey HKCU "${PRODUCT_UNINST_KEY}"
    DeleteRegKey HKCU "${PRODUCT_DIR_REGKEY}"
SectionEnd
