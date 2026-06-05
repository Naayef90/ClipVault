# ============================================================
# validate.ps1 — Run before EVERY build to catch errors early
# Usage: .\validate.ps1
# All 14 rules from the build checklist are enforced here.
# ============================================================

$errors   = @()
$warnings = @()
$passed   = 0

function Pass($msg)    { Write-Host "  ✓ $msg" -ForegroundColor Green;  $script:passed++ }
function Fail($msg)    { Write-Host "  ✗ $msg" -ForegroundColor Red;    $script:errors += $msg }
function Warn($msg)    { Write-Host "  ⚠ $msg" -ForegroundColor Yellow; $script:warnings += $msg }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Pre-Build Validator — Clipboard APP" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── RULE 1: Node / npm available ────────────────────────────
Write-Host "[ Environment ]" -ForegroundColor Magenta
try {
    $nodeVer = node --version 2>&1
    Pass "Node.js $nodeVer"
} catch { Fail "Node.js not found. Install from https://nodejs.org" }

try {
    $npmVer = npm --version 2>&1
    Pass "npm $npmVer"
} catch { Fail "npm not found" }

# ── RULE 7: JAVA_HOME ────────────────────────────────────────
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Pass "JAVA_HOME = $env:JAVA_HOME"
} else {
    $fallback = "C:\Program Files\Android\Android Studio\jbr"
    if (Test-Path "$fallback\bin\java.exe") {
        $env:JAVA_HOME = $fallback
        $env:PATH += ";$fallback\bin"
        Warn "JAVA_HOME not set — using fallback: $fallback. Run setup.ps1 to fix permanently."
    } else {
        Fail "JAVA_HOME not set and Android Studio JBR not found. Run: .\setup.ps1"
    }
}

# ── RULE 7: ANDROID_HOME ─────────────────────────────────────
$androidSdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
if (Test-Path "$androidSdk\platform-tools\adb.exe") {
    $env:ANDROID_HOME = $androidSdk
    $env:PATH += ";$androidSdk\platform-tools"
    Pass "ANDROID_HOME = $androidSdk"
} else {
    Fail "Android SDK not found. Open Android Studio → SDK Manager → install Platform-Tools."
}

# ── RULE 6: local.properties ─────────────────────────────────
Write-Host ""
Write-Host "[ Android Config ]" -ForegroundColor Magenta
if (Test-Path "android\local.properties") {
    $lp = Get-Content "android\local.properties" -Raw
    if ($lp -match "sdk\.dir=") {
        Pass "android\local.properties exists with sdk.dir"
    } else {
        Fail "android\local.properties exists but sdk.dir is missing"
    }
} else {
    Fail "android\local.properties missing. Run: .\setup.ps1"
}

# ── RULE 9: Kotlin classpath pinned ──────────────────────────
if (Test-Path "android\build.gradle") {
    $bg = Get-Content "android\build.gradle" -Raw
    if ($bg -match 'kotlin-gradle-plugin:\$\{kotlinVersion\}' -or $bg -match 'kotlin-gradle-plugin:1\.9\.2[5-9]') {
        Pass "android\build.gradle pins kotlin-gradle-plugin version explicitly"
    } else {
        Fail "android\build.gradle has unversioned kotlin-gradle-plugin. Add: classpath(`"org.jetbrains.kotlin:kotlin-gradle-plugin:`${kotlinVersion}`")"
    }
}

# ── RULE 8: gradle.properties settings ───────────────────────
if (Test-Path "android\gradle.properties") {
    $gp = Get-Content "android\gradle.properties" -Raw

    if ($gp -match "kotlin\.compiler\.execution\.strategy=in-process") {
        Pass "gradle.properties: kotlin.compiler.execution.strategy=in-process"
    } else {
        Fail "gradle.properties missing: kotlin.compiler.execution.strategy=in-process  (fixes Windows Kotlin daemon crash)"
    }

    if ($gp -match "android\.kotlinVersion=1\.9\.2[5-9]") {
        Pass "gradle.properties: android.kotlinVersion >= 1.9.25"
    } else {
        Fail "gradle.properties missing: android.kotlinVersion=1.9.25  (required for Compose Compiler 1.5.15)"
    }

    if ($gp -match "Xmx[3-9][0-9]{3}m|-Xmx[1-9][0-9]{4}m") {
        Pass "gradle.properties: JVM heap >= 3 GB"
    } else {
        Warn "gradle.properties: JVM heap may be too low. Recommended: -Xmx4096m"
    }
}

# ── RULE 5: Assets folder ─────────────────────────────────────
Write-Host ""
Write-Host "[ Assets ]" -ForegroundColor Magenta
$appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
$iconRef  = $appJson.expo.icon
$splashRef = $appJson.expo.splash.image

if ($iconRef -and -not (Test-Path $iconRef.TrimStart("./"))) {
    Fail "app.json references icon '$iconRef' but file does not exist"
} else {
    Pass "Icon reference OK (or not set)"
}

if ($splashRef -and -not (Test-Path $splashRef.TrimStart("./"))) {
    Fail "app.json references splash '$splashRef' but file does not exist"
} else {
    Pass "Splash reference OK (or not set)"
}

# ── RULE 3: Bad plugins in app.json ──────────────────────────
Write-Host ""
Write-Host "[ app.json Plugins ]" -ForegroundColor Magenta
$bannedPlugins = @("react-native-mmkv", "react-native-android-widget")
$pluginsRaw = Get-Content "app.json" -Raw
foreach ($banned in $bannedPlugins) {
    if ($pluginsRaw -match [regex]::Escape($banned)) {
        Fail "app.json plugins contains '$banned' which has no valid Expo config plugin"
    } else {
        Pass "app.json does not contain banned plugin: $banned"
    }
}

# ── RULE 4: MMKV version check ────────────────────────────────
Write-Host ""
Write-Host "[ Package Compatibility ]" -ForegroundColor Magenta
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
    $mmkvVer = $pkg.dependencies.'react-native-mmkv'
    if ($mmkvVer) {
        if ($mmkvVer -match "^\^?2\." -or $mmkvVer -match "^~?2\.") {
            Pass "react-native-mmkv is v2.x (old arch compatible)"
        } elseif ($mmkvVer -match "^\^?3\." -or $mmkvVer -match "^~?3\.") {
            Fail "react-native-mmkv is v3.x — incompatible with newArchEnabled=false. Use v2.x"
        }
    }

    # Check @types/react-native is not present (retired in RN 0.76)
    $typesRN = $pkg.devDependencies.'@types/react-native'
    if ($typesRN) {
        Fail "@types/react-native is in devDependencies — this package is retired in RN 0.76. Remove it."
    } else {
        Pass "@types/react-native correctly absent (types bundled in react-native 0.76)"
    }
}

# ── RULE 14: google-services.json is real ────────────────────
Write-Host ""
Write-Host "[ Firebase ]" -ForegroundColor Magenta
if (Test-Path "google-services.json") {
    $gsj = Get-Content "google-services.json" -Raw
    if ($gsj -match "REPLACE" -or $gsj -match "_NOTICE") {
        Fail "google-services.json is still a placeholder. Download real file from Firebase Console."
    } else {
        Pass "google-services.json appears to be a real Firebase config"
    }
} else {
    Fail "google-services.json missing. Download from Firebase Console."
}

# ── RULE 1: Phone connected ───────────────────────────────────
Write-Host ""
Write-Host "[ Device ]" -ForegroundColor Magenta
try {
    $adbOut = adb devices 2>&1
    if ($adbOut -match "\bdevice$") {
        Pass "Android device detected via ADB"
    } else {
        Warn "No Android device detected. Plug in phone with USB Debugging ON before running."
    }
} catch {
    Warn "ADB not in PATH — add ANDROID_HOME\platform-tools to PATH"
}

# ── node_modules exists ───────────────────────────────────────
Write-Host ""
Write-Host "[ Dependencies ]" -ForegroundColor Magenta
if (Test-Path "node_modules") {
    Pass "node_modules folder exists"
} else {
    Fail "node_modules missing. Run: npm install --legacy-peer-deps"
}

# ── android folder exists (prebuild done) ─────────────────────
if (Test-Path "android\gradlew.bat") {
    Pass "android\ folder exists (prebuild was run)"
} else {
    Fail "android\ folder missing. Run: npx expo prebuild --platform android --clean"
}

# ── Summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Results: $passed passed, $($errors.Count) errors, $($warnings.Count) warnings" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "ERRORS — fix these before building:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  ✗ $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Build blocked. Fix all errors above first." -ForegroundColor Red
    exit 1
} elseif ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Warnings found but build can proceed." -ForegroundColor Yellow
    Write-Host "Run: npx expo run:android" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "All checks passed! Safe to build." -ForegroundColor Green
    Write-Host "Run: npx expo run:android" -ForegroundColor Green
    exit 0
}
