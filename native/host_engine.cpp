/**
 * Native Windows x64 Desktop Host Engine
 * Architecture: Win32 + DWM Per-Pixel Transparency (Windows 10/11) + Microsoft Edge WebView2
 * Internal Modules: Augusto (Core State), Zelada (Virtual Host/Profile),
 *                   Vergaray (IPC Bridge), Danae (Splash Geometry/DWM),
 *                   Tigre (WebView2 Loader Runtime).
 *
 * Startup Behavior:
 *  - Launches as a TRUE transparent-background, borderless, frameless, top-most floating OS
 *    Login Splash Screen directly over the Windows desktop (DwmExtendFrameIntoClientArea -1 +
 *    WebView2 DefaultBackgroundColor {0,0,0,0} + transparent HTML/body).
 *  - Only the floating rounded Login card and its soft alpha shadow are visible over the desktop.
 *  - On LOGIN_SUCCESS, seamlessly switches to opaque solid #f0f7ff + native resizable 1366x768 window.
 *  - On LOGOUT, morphs seamlessly back into the transparent floating Login Splash Screen.
 */

#ifndef UNICODE
#define UNICODE
#endif
#ifndef _UNICODE
#define _UNICODE
#endif
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#include <windows.h>
#include <dwmapi.h>
#include <shlobj.h>
#include <shellapi.h>
#include <objbase.h>
#include <shlwapi.h>
#include <initguid.h>
#include <string>
#include <algorithm>
#include <cwchar>

#include "WebView2.h"

// DWM attributes for Windows 10/11 (defined safely for MinGW headers)
#ifndef DWMWA_USE_IMMERSIVE_DARK_MODE
#define DWMWA_USE_IMMERSIVE_DARK_MODE 20
#endif
#ifndef DWMWA_WINDOW_CORNER_PREFERENCE
#define DWMWA_WINDOW_CORNER_PREFERENCE 33
#endif
#ifndef DWMWA_BORDER_COLOR
#define DWMWA_BORDER_COLOR 34
#endif
#ifndef DWMWCP_DEFAULT
#define DWMWCP_DEFAULT 0
#endif
#ifndef DWMWCP_DONOTROUND
#define DWMWCP_DONOTROUND 1
#endif
#ifndef DWMWA_COLOR_NONE
#define DWMWA_COLOR_NONE 0xFFFFFFFE
#endif
#ifndef DWMWA_COLOR_DEFAULT
#define DWMWA_COLOR_DEFAULT 0xFFFFFFFF
#endif

// Timers
static constexpr UINT_PTR TIMER_FADE_IN = 1001;
static constexpr UINT_PTR TIMER_SPLASH_FALLBACK_SHOW = 1002;

// Danae: Transparent Splash screen geometry & composition constants (96 DPI logical px)
// Width = 438px card + 28px transparent shadow padding on left and right = 494px
static constexpr int DanaeSplashWidth = 494;
static constexpr int DanaeSplashDefaultHeight = 668;
static constexpr int DanaeSplashMinHeight = 560;
static constexpr int DanaeSplashMaxHeight = 820;
static constexpr int APP_LOGICAL_WIDTH = 1366;
static constexpr int APP_LOGICAL_HEIGHT = 768;

// Vergaray & Zelada internal host identifiers
static constexpr const wchar_t* VergarayWindowClass = L"VergarayDesktopSplashHost";
static constexpr const wchar_t* ZeladaVirtualHost = L"zelada.local";
static constexpr const wchar_t* ZeladaStartUrl = L"https://zelada.local/index.html";

// Tigre: Dynamically loaded WebView2Loader entrypoint
typedef HRESULT(STDAPICALLTYPE* PFN_CreateCoreWebView2EnvironmentWithOptions)(
    PCWSTR browserExecutableFolder,
    PCWSTR userDataFolder,
    ICoreWebView2EnvironmentOptions* environmentOptions,
    ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler* environmentCreatedHandler);

typedef UINT(WINAPI* PFN_GetDpiForWindow)(HWND);
typedef BOOL(WINAPI* PFN_SetProcessDpiAwarenessContext)(HANDLE);

// Augusto: Global host state
struct AugustoHostState {
    HWND hwnd = nullptr;
    HMODULE tigreLoaderModule = nullptr;
    ICoreWebView2Environment* env = nullptr;
    ICoreWebView2Controller* controller = nullptr;
    ICoreWebView2* webview = nullptr;
    bool isSplashMode = true;
    bool isVisible = false;
    int currentAlpha = 0;
    int splashLogicalHeight = DanaeSplashDefaultHeight;
    std::wstring exeDir;
    std::wstring appDir;
    std::wstring zeladaProfileDir;
};

static AugustoHostState Augusto;

// Helper: DPI scaling
static UINT GetWindowDpiSafe(HWND hwnd) {
    HMODULE hUser32 = GetModuleHandleW(L"user32.dll");
    if (hUser32) {
        auto pGetDpi = reinterpret_cast<PFN_GetDpiForWindow>(
            GetProcAddress(hUser32, "GetDpiForWindow"));
        if (pGetDpi && hwnd) {
            UINT dpi = pGetDpi(hwnd);
            if (dpi >= 96) return dpi;
        }
    }
    HDC hdc = GetDC(hwnd);
    UINT dpi = hdc ? static_cast<UINT>(GetDeviceCaps(hdc, LOGPIXELSX)) : 96;
    if (hdc) ReleaseDC(hwnd, hdc);
    return dpi >= 96 ? dpi : 96;
}

static int ScaleDpi(int logicalPx, UINT dpi) {
    return MulDiv(logicalPx, static_cast<int>(dpi), 96);
}

static RECT GetPrimaryMonitorWorkArea() {
    POINT pt = { 0, 0 };
    HMONITOR hMon = MonitorFromPoint(pt, MONITOR_DEFAULTTOPRIMARY);
    MONITORINFO mi = {};
    mi.cbSize = sizeof(mi);
    if (GetMonitorInfoW(hMon, &mi)) {
        return mi.rcWork;
    }
    RECT rc = { 0, 0, GetSystemMetrics(SM_CXSCREEN), GetSystemMetrics(SM_CYSCREEN) };
    return rc;
}

static void SyncWebViewBounds() {
    if (!Augusto.controller || !Augusto.hwnd) return;
    RECT bounds = {};
    GetClientRect(Augusto.hwnd, &bounds);
    Augusto.controller->put_Bounds(bounds);
}

static void SetWebViewBackgroundColor(BYTE a, BYTE r, BYTE g, BYTE b) {
    if (!Augusto.controller) return;
    ICoreWebView2Controller2* controller2 = nullptr;
    if (SUCCEEDED(Augusto.controller->QueryInterface(IID_ICoreWebView2Controller2,
                                                     reinterpret_cast<void**>(&controller2))) &&
        controller2) {
        COREWEBVIEW2_COLOR color = { a, r, g, b };
        controller2->put_DefaultBackgroundColor(color);
        controller2->Release();
    }
}

// Danae: Enable true per-pixel DWM sheet-of-glass transparency on the borderless splash HWND
static void ApplyDanaeTransparentVisuals(HWND hwnd) {
    // Clear any GDI region so soft alpha shadows around the floating card are never clipped
    SetWindowRgn(hwnd, nullptr, TRUE);

    // Extend DWM composition across the entire client area (-1) -> genuine alpha=0 desktop passthrough
    MARGINS glassMargins = { -1, -1, -1, -1 };
    DwmExtendFrameIntoClientArea(hwnd, &glassMargins);

    // On Windows 11, disable DWM's own outer frame border/rounding so the outer container is 100% invisible
    DWORD cornerNone = DWMWCP_DONOTROUND;
    DwmSetWindowAttribute(hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, &cornerNone, sizeof(cornerNone));

    COLORREF borderNone = DWMWA_COLOR_NONE;
    DwmSetWindowAttribute(hwnd, DWMWA_BORDER_COLOR, &borderNone, sizeof(borderNone));

    // Set WebView2 controller surface background to alpha = 0 (transparent)
    SetWebViewBackgroundColor(0, 0, 0, 0);
}

static void PositionSplashWindow(int logicalHeight, bool ensureVisible) {
    if (!Augusto.hwnd) return;
    logicalHeight = std::max(DanaeSplashMinHeight,
                             std::min(DanaeSplashMaxHeight, logicalHeight));
    Augusto.splashLogicalHeight = logicalHeight;

    UINT dpi = GetWindowDpiSafe(Augusto.hwnd);
    RECT work = GetPrimaryMonitorWorkArea();
    int workW = work.right - work.left;
    int workH = work.bottom - work.top;

    int w = std::min(ScaleDpi(DanaeSplashWidth, dpi), workW - 24);
    int h = std::min(ScaleDpi(logicalHeight, dpi), workH - 24);
    int x = work.left + (workW - w) / 2;
    int y = work.top + (workH - h) / 2;

    UINT flags = SWP_NOACTIVATE | SWP_FRAMECHANGED;
    if (ensureVisible) {
        flags = SWP_SHOWWINDOW | SWP_FRAMECHANGED;
    }

    SetWindowPos(Augusto.hwnd, HWND_TOPMOST, x, y, w, h, flags);
    ApplyDanaeTransparentVisuals(Augusto.hwnd);
    SyncWebViewBounds();
}

static void BeginSplashFadeIn() {
    if (!Augusto.hwnd || Augusto.isVisible) return;
    KillTimer(Augusto.hwnd, TIMER_SPLASH_FALLBACK_SHOW);
    Augusto.isVisible = true;
    Augusto.currentAlpha = 0;

    LONG_PTR exStyle = GetWindowLongPtrW(Augusto.hwnd, GWL_EXSTYLE);
    SetWindowLongPtrW(Augusto.hwnd, GWL_EXSTYLE, exStyle | WS_EX_LAYERED);
    SetLayeredWindowAttributes(Augusto.hwnd, 0, 0, LWA_ALPHA);

    ShowWindow(Augusto.hwnd, SW_SHOW);
    SetForegroundWindow(Augusto.hwnd);
    SetTimer(Augusto.hwnd, TIMER_FADE_IN, 15, nullptr);
}

static void SwitchToMainAppWindow() {
    if (!Augusto.hwnd) return;
    KillTimer(Augusto.hwnd, TIMER_FADE_IN);
    KillTimer(Augusto.hwnd, TIMER_SPLASH_FALLBACK_SHOW);
    Augusto.isSplashMode = false;
    Augusto.isVisible = true;

    // Restore opaque solid background (#f0f7ff) and standard Windows 10/11 desktop frame
    SetWebViewBackgroundColor(255, 240, 247, 255);
    SetWindowRgn(Augusto.hwnd, nullptr, TRUE);

    MARGINS zeroMargins = { 0, 0, 0, 0 };
    DwmExtendFrameIntoClientArea(Augusto.hwnd, &zeroMargins);

    DWORD defaultCorner = DWMWCP_DEFAULT;
    DwmSetWindowAttribute(Augusto.hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, &defaultCorner, sizeof(defaultCorner));

    COLORREF defaultBorder = DWMWA_COLOR_DEFAULT;
    DwmSetWindowAttribute(Augusto.hwnd, DWMWA_BORDER_COLOR, &defaultBorder, sizeof(defaultBorder));

    BOOL darkMode = FALSE;
    DwmSetWindowAttribute(Augusto.hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE, &darkMode, sizeof(darkMode));

    LONG_PTR style = WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_VISIBLE;
    LONG_PTR exStyle = WS_EX_APPWINDOW;
    SetWindowLongPtrW(Augusto.hwnd, GWL_STYLE, style);
    SetWindowLongPtrW(Augusto.hwnd, GWL_EXSTYLE, exStyle);

    UINT dpi = GetWindowDpiSafe(Augusto.hwnd);
    RECT work = GetPrimaryMonitorWorkArea();
    int workW = work.right - work.left;
    int workH = work.bottom - work.top;

    int w = std::min(ScaleDpi(APP_LOGICAL_WIDTH, dpi), (workW * 95) / 100);
    int h = std::min(ScaleDpi(APP_LOGICAL_HEIGHT, dpi), (workH * 94) / 100);
    int x = work.left + (workW - w) / 2;
    int y = work.top + (workH - h) / 2;

    SetWindowPos(Augusto.hwnd, HWND_NOTOPMOST, x, y, w, h,
                 SWP_FRAMECHANGED | SWP_SHOWWINDOW);
    ShowWindow(Augusto.hwnd, SW_SHOWNORMAL);
    SetForegroundWindow(Augusto.hwnd);
    InvalidateRect(Augusto.hwnd, nullptr, TRUE);
    SyncWebViewBounds();
}

static void SwitchToSplashWindow() {
    if (!Augusto.hwnd) return;
    Augusto.isSplashMode = true;

    if (IsZoomed(Augusto.hwnd)) {
        ShowWindow(Augusto.hwnd, SW_RESTORE);
    }

    LONG_PTR style = WS_POPUP | WS_CLIPCHILDREN | WS_VISIBLE;
    LONG_PTR exStyle = WS_EX_TOPMOST | WS_EX_APPWINDOW;
    SetWindowLongPtrW(Augusto.hwnd, GWL_STYLE, style);
    SetWindowLongPtrW(Augusto.hwnd, GWL_EXSTYLE, exStyle);

    PositionSplashWindow(Augusto.splashLogicalHeight, true);
    InvalidateRect(Augusto.hwnd, nullptr, TRUE);
    SetForegroundWindow(Augusto.hwnd);
}

// Parse simple integer field from JSON payload
static int ExtractJsonInt(const std::wstring& json, const std::wstring& key, int fallback) {
    std::wstring needle = L"\"" + key + L"\"";
    size_t pos = json.find(needle);
    if (pos == std::wstring::npos) return fallback;
    pos = json.find(L':', pos + needle.size());
    if (pos == std::wstring::npos) return fallback;
    pos++;
    while (pos < json.size() && (json[pos] == L' ' || json[pos] == L'\t')) pos++;
    try {
        return std::stoi(json.substr(pos));
    } catch (...) {
        return fallback;
    }
}

// Vergaray: Native IPC bridge dispatcher
static void HandleVergarayMessage(const std::wstring& msg) {
    if (msg.find(L"\"DRAG_WINDOW\"") != std::wstring::npos) {
        if (Augusto.isSplashMode && Augusto.hwnd) {
            ReleaseCapture();
            SendMessageW(Augusto.hwnd, WM_NCLBUTTONDOWN, HTCAPTION, 0);
        }
        return;
    }
    if (msg.find(L"\"CLOSE_APP\"") != std::wstring::npos) {
        if (Augusto.hwnd) {
            DestroyWindow(Augusto.hwnd);
        }
        return;
    }
    if (msg.find(L"\"LOGIN_SUCCESS\"") != std::wstring::npos) {
        SwitchToMainAppWindow();
        return;
    }
    if (msg.find(L"\"LOGOUT\"") != std::wstring::npos) {
        SwitchToSplashWindow();
        return;
    }
    if (msg.find(L"\"SPLASH_READY\"") != std::wstring::npos) {
        int h = ExtractJsonInt(msg, L"height", DanaeSplashDefaultHeight);
        if (Augusto.isSplashMode) {
            PositionSplashWindow(h, false);
            BeginSplashFadeIn();
        }
        return;
    }
    if (msg.find(L"\"SET_SPLASH_HEIGHT\"") != std::wstring::npos) {
        int h = ExtractJsonInt(msg, L"height", Augusto.splashLogicalHeight);
        if (Augusto.isSplashMode && std::abs(h - Augusto.splashLogicalHeight) >= 4) {
            PositionSplashWindow(h, Augusto.isVisible);
        }
        return;
    }
}

// Fallback launcher using Microsoft Edge App Mode if WebView2 Runtime is missing
static void LaunchEdgeFallback() {
    std::wstring indexHtml = Augusto.appDir + L"\\index.html";
    std::wstring edgeCandidates[3];
    WCHAR buf[MAX_PATH];

    if (ExpandEnvironmentStringsW(L"%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe", buf, MAX_PATH))
        edgeCandidates[0] = buf;
    if (ExpandEnvironmentStringsW(L"%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe", buf, MAX_PATH))
        edgeCandidates[1] = buf;
    if (ExpandEnvironmentStringsW(L"%LOCALAPPDATA%\\Microsoft\\Edge\\Application\\msedge.exe", buf, MAX_PATH))
        edgeCandidates[2] = buf;

    for (const auto& edgePath : edgeCandidates) {
        if (!edgePath.empty() && GetFileAttributesW(edgePath.c_str()) != INVALID_FILE_ATTRIBUTES) {
            std::wstring cmd = L"\"" + edgePath + L"\" --app=\"file:///" + indexHtml +
                L"\" --allow-file-access-from-files --window-size=1366,768 --user-data-dir=\"" +
                Augusto.zeladaProfileDir + L"\\EdgeProfile\"";
            STARTUPINFOW si = {};
            si.cb = sizeof(si);
            PROCESS_INFORMATION pi = {};
            if (CreateProcessW(nullptr, &cmd[0], nullptr, nullptr, FALSE, 0, nullptr,
                               Augusto.exeDir.c_str(), &si, &pi)) {
                CloseHandle(pi.hProcess);
                CloseHandle(pi.hThread);
                return;
            }
        }
    }
    ShellExecuteW(nullptr, L"open", indexHtml.c_str(), nullptr, nullptr, SW_SHOWNORMAL);
}

// Minimal, standards-compliant COM callback classes (no MSVC WRL dependency)
class VergarayWebMessageHandler : public ICoreWebView2WebMessageReceivedEventHandler {
    ULONG refCount_ = 1;
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppv) override {
        if (!ppv) return E_POINTER;
        if (riid == IID_IUnknown || riid == IID_ICoreWebView2WebMessageReceivedEventHandler) {
            *ppv = static_cast<ICoreWebView2WebMessageReceivedEventHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppv = nullptr;
        return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&refCount_); }
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG c = InterlockedDecrement(&refCount_);
        if (c == 0) delete this;
        return c;
    }
    HRESULT STDMETHODCALLTYPE Invoke(ICoreWebView2*,
                                     ICoreWebView2WebMessageReceivedEventArgs* args) override {
        LPWSTR rawMsg = nullptr;
        if (SUCCEEDED(args->TryGetWebMessageAsString(&rawMsg)) && rawMsg) {
            std::wstring msg(rawMsg);
            CoTaskMemFree(rawMsg);
            HandleVergarayMessage(msg);
        }
        return S_OK;
    }
};

class NavigationCompletedHandler : public ICoreWebView2NavigationCompletedEventHandler {
    ULONG refCount_ = 1;
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppv) override {
        if (!ppv) return E_POINTER;
        if (riid == IID_IUnknown || riid == IID_ICoreWebView2NavigationCompletedEventHandler) {
            *ppv = static_cast<ICoreWebView2NavigationCompletedEventHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppv = nullptr;
        return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&refCount_); }
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG c = InterlockedDecrement(&refCount_);
        if (c == 0) delete this;
        return c;
    }
    HRESULT STDMETHODCALLTYPE Invoke(ICoreWebView2*,
                                     ICoreWebView2NavigationCompletedEventArgs*) override {
        if (Augusto.hwnd && !Augusto.isVisible) {
            SetTimer(Augusto.hwnd, TIMER_SPLASH_FALLBACK_SHOW, 350, nullptr);
        }
        return S_OK;
    }
};

class ControllerCompletedHandler : public ICoreWebView2CreateCoreWebView2ControllerCompletedHandler {
    ULONG refCount_ = 1;
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppv) override {
        if (!ppv) return E_POINTER;
        if (riid == IID_IUnknown ||
            riid == IID_ICoreWebView2CreateCoreWebView2ControllerCompletedHandler) {
            *ppv = static_cast<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppv = nullptr;
        return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&refCount_); }
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG c = InterlockedDecrement(&refCount_);
        if (c == 0) delete this;
        return c;
    }
    HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2Controller* controller) override {
        if (FAILED(result) || !controller) {
            LaunchEdgeFallback();
            DestroyWindow(Augusto.hwnd);
            return result;
        }

        Augusto.controller = controller;
        Augusto.controller->AddRef();

        // Set TRUE per-pixel transparent surface (Alpha = 0) so the Windows Desktop shows behind the Login card
        SetWebViewBackgroundColor(0, 0, 0, 0);

        if (SUCCEEDED(controller->get_CoreWebView2(&Augusto.webview)) && Augusto.webview) {
            ICoreWebView2Settings* settings = nullptr;
            if (SUCCEEDED(Augusto.webview->get_Settings(&settings)) && settings) {
                settings->put_IsScriptEnabled(TRUE);
                settings->put_IsWebMessageEnabled(TRUE);
                settings->put_AreDefaultScriptDialogsEnabled(TRUE);
                settings->put_IsStatusBarEnabled(FALSE);
                settings->put_AreDefaultContextMenusEnabled(FALSE);
                settings->put_AreDevToolsEnabled(FALSE);
                settings->put_IsZoomControlEnabled(FALSE);
                settings->Release();
            }

            EventRegistrationToken msgToken = {};
            auto* msgHandler = new VergarayWebMessageHandler();
            Augusto.webview->add_WebMessageReceived(msgHandler, &msgToken);
            msgHandler->Release();

            EventRegistrationToken navToken = {};
            auto* navHandler = new NavigationCompletedHandler();
            Augusto.webview->add_NavigationCompleted(navHandler, &navToken);
            navHandler->Release();

            // Zelada: Map local app/ folder to https://zelada.local/ (zero CORS, clean localStorage)
            ICoreWebView2_3* webview3 = nullptr;
            if (SUCCEEDED(Augusto.webview->QueryInterface(IID_ICoreWebView2_3,
                                                          reinterpret_cast<void**>(&webview3))) &&
                webview3) {
                webview3->SetVirtualHostNameToFolderMapping(
                    ZeladaVirtualHost,
                    Augusto.appDir.c_str(),
                    COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW);
                webview3->Release();
                Augusto.webview->Navigate(ZeladaStartUrl);
            } else {
                std::wstring fileUrl = L"file:///" + Augusto.appDir + L"\\index.html";
                std::replace(fileUrl.begin(), fileUrl.end(), L'\\', L'/');
                Augusto.webview->Navigate(fileUrl.c_str());
            }
        }

        Augusto.controller->put_IsVisible(TRUE);
        SyncWebViewBounds();
        return S_OK;
    }
};

class EnvironmentCompletedHandler
    : public ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler {
    ULONG refCount_ = 1;
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppv) override {
        if (!ppv) return E_POINTER;
        if (riid == IID_IUnknown ||
            riid == IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler) {
            *ppv = static_cast<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppv = nullptr;
        return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&refCount_); }
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG c = InterlockedDecrement(&refCount_);
        if (c == 0) delete this;
        return c;
    }
    HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2Environment* env) override {
        if (FAILED(result) || !env) {
            LaunchEdgeFallback();
            DestroyWindow(Augusto.hwnd);
            return result;
        }
        Augusto.env = env;
        Augusto.env->AddRef();

        auto* ctrlHandler = new ControllerCompletedHandler();
        HRESULT hr = env->CreateCoreWebView2Controller(Augusto.hwnd, ctrlHandler);
        ctrlHandler->Release();
        if (FAILED(hr)) {
            LaunchEdgeFallback();
            DestroyWindow(Augusto.hwnd);
        }
        return S_OK;
    }
};

static LRESULT CALLBACK MainWndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
        case WM_SIZE: {
            SyncWebViewBounds();
            if (Augusto.isSplashMode) {
                ApplyDanaeTransparentVisuals(hwnd);
            }
            return 0;
        }
        case WM_GETMINMAXINFO: {
            auto* mmi = reinterpret_cast<MINMAXINFO*>(lParam);
            if (!Augusto.isSplashMode) {
                UINT dpi = GetWindowDpiSafe(hwnd);
                mmi->ptMinTrackSize.x = ScaleDpi(760, dpi);
                mmi->ptMinTrackSize.y = ScaleDpi(540, dpi);
            }
            return 0;
        }
        case WM_TIMER: {
            if (wParam == TIMER_FADE_IN) {
                Augusto.currentAlpha += 28;
                if (Augusto.currentAlpha >= 255) {
                    Augusto.currentAlpha = 255;
                    KillTimer(hwnd, TIMER_FADE_IN);
                    SetLayeredWindowAttributes(hwnd, 0, 255, LWA_ALPHA);
                    // Remove WS_EX_LAYERED after fade-in so DWM per-pixel alpha runs at full GPU speed
                    LONG_PTR exStyle = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
                    SetWindowLongPtrW(hwnd, GWL_EXSTYLE, exStyle & ~WS_EX_LAYERED);
                    SetWindowPos(hwnd, nullptr, 0, 0, 0, 0,
                                 SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED);
                    ApplyDanaeTransparentVisuals(hwnd);
                } else {
                    SetLayeredWindowAttributes(hwnd, 0, static_cast<BYTE>(Augusto.currentAlpha),
                                               LWA_ALPHA);
                }
                return 0;
            }
            if (wParam == TIMER_SPLASH_FALLBACK_SHOW) {
                KillTimer(hwnd, TIMER_SPLASH_FALLBACK_SHOW);
                BeginSplashFadeIn();
                return 0;
            }
            break;
        }
        case WM_ERASEBKGND: {
            HDC hdc = reinterpret_cast<HDC>(wParam);
            RECT rc = {};
            GetClientRect(hwnd, &rc);
            if (Augusto.isSplashMode) {
                // Under DwmExtendFrameIntoClientArea(-1), ARGB 0x00000000 (BLACK_BRUSH) is 100% transparent
                FillRect(hdc, &rc, static_cast<HBRUSH>(GetStockObject(BLACK_BRUSH)));
            } else {
                HBRUSH br = CreateSolidBrush(RGB(240, 247, 255));
                FillRect(hdc, &rc, br);
                DeleteObject(br);
            }
            return 1;
        }
        case WM_PAINT: {
            PAINTSTRUCT ps = {};
            HDC hdc = BeginPaint(hwnd, &ps);
            if (Augusto.isSplashMode) {
                FillRect(hdc, &ps.rcPaint, static_cast<HBRUSH>(GetStockObject(BLACK_BRUSH)));
            } else {
                HBRUSH br = CreateSolidBrush(RGB(240, 247, 255));
                FillRect(hdc, &ps.rcPaint, br);
                DeleteObject(br);
            }
            EndPaint(hwnd, &ps);
            return 0;
        }
        case WM_DESTROY: {
            KillTimer(hwnd, TIMER_FADE_IN);
            KillTimer(hwnd, TIMER_SPLASH_FALLBACK_SHOW);
            if (Augusto.webview) {
                Augusto.webview->Release();
                Augusto.webview = nullptr;
            }
            if (Augusto.controller) {
                Augusto.controller->Close();
                Augusto.controller->Release();
                Augusto.controller = nullptr;
            }
            if (Augusto.env) {
                Augusto.env->Release();
                Augusto.env = nullptr;
            }
            PostQuitMessage(0);
            return 0;
        }
        default:
            break;
    }
    return DefWindowProcW(hwnd, msg, wParam, lParam);
}

static bool ResolveAppDirectory() {
    WCHAR exePath[MAX_PATH] = {};
    if (GetModuleFileNameW(nullptr, exePath, MAX_PATH) == 0) return false;

    std::wstring full(exePath);
    size_t slash = full.find_last_of(L"\\/");
    Augusto.exeDir = (slash != std::wstring::npos) ? full.substr(0, slash) : L".";

    const std::wstring candidates[] = {
        Augusto.exeDir + L"\\app",
        Augusto.exeDir,
        Augusto.exeDir + L"\\dist",
    };

    for (const auto& dir : candidates) {
        std::wstring indexFile = dir + L"\\index.html";
        if (GetFileAttributesW(indexFile.c_str()) != INVALID_FILE_ATTRIBUTES) {
            Augusto.appDir = dir;
            return true;
        }
    }
    return false;
}

// Tigre: Load official Microsoft WebView2Loader.dll located next to the executable
static PFN_CreateCoreWebView2EnvironmentWithOptions InitializeTigreWebViewLoader() {
    std::wstring loaderPath = Augusto.exeDir + L"\\WebView2Loader.dll";
    Augusto.tigreLoaderModule = LoadLibraryW(loaderPath.c_str());
    if (!Augusto.tigreLoaderModule) {
        Augusto.tigreLoaderModule = LoadLibraryW(L"WebView2Loader.dll");
    }
    if (!Augusto.tigreLoaderModule) return nullptr;

    return reinterpret_cast<PFN_CreateCoreWebView2EnvironmentWithOptions>(
        GetProcAddress(Augusto.tigreLoaderModule, "CreateCoreWebView2EnvironmentWithOptions"));
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR, int) {
    // Prevent any white flicker before WebView2 initializes by defaulting background to ARGB 0x00000000
    SetEnvironmentVariableW(L"WEBVIEW2_DEFAULT_BACKGROUND_COLOR", L"00000000");

    HMODULE hUser32 = GetModuleHandleW(L"user32.dll");
    if (hUser32) {
        auto pSetDpiCtx = reinterpret_cast<PFN_SetProcessDpiAwarenessContext>(
            GetProcAddress(hUser32, "SetProcessDpiAwarenessContext"));
        if (pSetDpiCtx) {
            pSetDpiCtx(reinterpret_cast<HANDLE>(-4));
        } else {
            SetProcessDPIAware();
        }
    }

    if (!ResolveAppDirectory()) {
        MessageBoxW(nullptr,
                    L"No se encontraron los archivos de la aplicación (carpeta app\\index.html).\n"
                    L"Por favor ejecute SedaTech_Setup.exe para instalar el programa.",
                    L"SedaTech · Sistema de Gestión de Tickets", MB_ICONERROR | MB_OK);
        return 1;
    }

    // Zelada: Prepare persistent WebView2 profile folder
    WCHAR localAppData[MAX_PATH] = {};
    if (SUCCEEDED(SHGetFolderPathW(nullptr, CSIDL_LOCAL_APPDATA, nullptr, 0, localAppData))) {
        Augusto.zeladaProfileDir = std::wstring(localAppData) + L"\\SedaTech\\ZeladaRuntime";
    } else {
        Augusto.zeladaProfileDir = Augusto.exeDir + L"\\ZeladaRuntime";
    }

    PFN_CreateCoreWebView2EnvironmentWithOptions pCreateEnv = InitializeTigreWebViewLoader();
    if (!pCreateEnv) {
        LaunchEdgeFallback();
        return 0;
    }

    HRESULT hrCo = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    if (FAILED(hrCo)) {
        LaunchEdgeFallback();
        return 0;
    }

    // Register native window class (no outer rectangular CS_DROPSHADOW so transparent canvas stays clean)
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof(wc);
    wc.style = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = MainWndProc;
    wc.hInstance = hInstance;
    wc.hIcon = LoadIconW(hInstance, MAKEINTRESOURCEW(1));
    wc.hIconSm = LoadIconW(hInstance, MAKEINTRESOURCEW(1));
    wc.hCursor = LoadCursorW(nullptr, IDC_ARROW);
    wc.hbrBackground = static_cast<HBRUSH>(GetStockObject(BLACK_BRUSH));
    wc.lpszClassName = VergarayWindowClass;
    RegisterClassExW(&wc);

    // Create TRUE transparent-background, borderless, top-most floating OS Login Splash Window
    RECT work = GetPrimaryMonitorWorkArea();
    int workW = work.right - work.left;
    int workH = work.bottom - work.top;
    int initW = DanaeSplashWidth;
    int initH = DanaeSplashDefaultHeight;
    int initX = work.left + (workW - initW) / 2;
    int initY = work.top + (workH - initH) / 2;

    Augusto.hwnd = CreateWindowExW(
        WS_EX_TOPMOST | WS_EX_LAYERED | WS_EX_APPWINDOW,
        VergarayWindowClass,
        L"SedaTech · Sistema de Gestión de Tickets",
        WS_POPUP | WS_CLIPCHILDREN,
        initX, initY, initW, initH,
        nullptr, nullptr, hInstance, nullptr);

    if (!Augusto.hwnd) {
        CoUninitialize();
        LaunchEdgeFallback();
        return 0;
    }

    SetLayeredWindowAttributes(Augusto.hwnd, 0, 0, LWA_ALPHA);
    PositionSplashWindow(DanaeSplashDefaultHeight, false);
    SetTimer(Augusto.hwnd, TIMER_SPLASH_FALLBACK_SHOW, 1800, nullptr);

    auto* envHandler = new EnvironmentCompletedHandler();
    HRESULT hrEnv = pCreateEnv(nullptr, Augusto.zeladaProfileDir.c_str(), nullptr, envHandler);
    envHandler->Release();

    if (FAILED(hrEnv)) {
        DestroyWindow(Augusto.hwnd);
        CoUninitialize();
        LaunchEdgeFallback();
        return 0;
    }

    MSG msg = {};
    while (GetMessageW(&msg, nullptr, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    if (Augusto.tigreLoaderModule) {
        FreeLibrary(Augusto.tigreLoaderModule);
        Augusto.tigreLoaderModule = nullptr;
    }
    CoUninitialize();
    return static_cast<int>(msg.wParam);
}
