# GUÍA DE COMPILACIÓN E INSTALACIÓN EN WINDOWS (TAURI 2 & NSIS)

## 1. Requisitos Previos en Windows 10 u 11
1. **Node.js** v20 o superior.
2. **Rust y Cargo:** Instalar desde [https://rustup.rs](https://rustup.rs) (seleccionar arquitectura `x86_64-pc-windows-msvc`).
3. **Microsoft C++ Build Tools:** Desde Visual Studio Installer (paquete «Desarrollo para el escritorio con C++»).
4. **Microsoft Edge WebView2:** Incluido por defecto en Windows 10 y Windows 11.

## 2. Comandos de Compilación del Instalador
Desde la terminal PowerShell o CMD de Windows en la carpeta raíz del proyecto:

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo con ventana nativa de Windows
npm run desktop:dev

# 3. Compilar la aplicación y generar el instalador NSIS Setup.exe
npm run desktop:build
```

## 3. Ubicación del Instalador Generado
Una vez completado el comando `npm run desktop:build`, el instalador se encontrará en:
```
src-tauri/target/release/bundle/nsis/SedaTech_1.0.0_x64-setup.exe
```

## 4. Características del Instalador NSIS
- Instalación con asistente en español.
- Creación automática de acceso directo en el Menú Inicio de Windows y en el Escritorio.
- Integración en el Panel de Control «Agregar o quitar programas» para desinstalación limpia.
- Inicio automático opcional tras finalizar la instalación.
