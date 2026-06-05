# ============================================================
# setup.ps1 — Run ONCE on any new machine before building
# Usage: .\setup.ps1
# ============================================================

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Clipboard APP — Machine Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. PowerShell Execution Policy ──────────────────────────
Write-Host "[1/6] Setting PowerShell ExecutionPolicy..." -ForegroundColor Yellow
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
Write-Host "      ✓ Done" -ForegroundColor Green

# ── 2. Permanent Environment Variables ──────────────────────
Write-Host "[2/6] Setting JAVA_HOME and ANDROID_HOME permanently..." -ForegroundColor Yellow

$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"

if (-not (Test-Path $javaHome)) {
    Write-Host "      ✗ Android Studio JBR not found at: $javaHome" -ForegroundColor Red
    Write-Host "        Install Android Studio first: https://developer.android.com/studio" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $androidHome)) {
    Write-Host "      ✗ Android SDK not found at: $androidHome" -ForegroundColor Red
    Write-Host "        Open Android Studio → SDK Manager → install Android 14 (API 34)" -ForegroundColor Red
    exit 1
}

[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")

$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$additions = "$androidHome\platform-tools;$javaHome\bin"
if ($currentPath -notlike "*platform-tools*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$additions", "User")
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:PATH += ";$additions"

Write-Host "      ✓ JAVA_HOME  = $javaHome" -ForegroundColor Green
Write-Host "      ✓ ANDROID_HOME = $androidHome" -ForegroundColor Green

# ── 3. local.properties ─────────────────────────────────────
Write-Host "[3/6] Creating android/local.properties..." -ForegroundColor Yellow
$sdkEscaped = $androidHome -replace '\\', '\\\\'
Set-Content "android\local.properties" "sdk.dir=$sdkEscaped"
Write-Host "      ✓ android\local.properties written" -ForegroundColor Green

# ── 4. npm install ───────────────────────────────────────────
Write-Host "[4/6] Installing npm dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ✗ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "      ✓ Dependencies installed" -ForegroundColor Green

# ── 5. expo-doctor ───────────────────────────────────────────
Write-Host "[5/6] Running expo-doctor..." -ForegroundColor Yellow
npx expo-doctor
Write-Host "      ✓ expo-doctor complete (fix any warnings above before building)" -ForegroundColor Green

# ── 6. ADB check ─────────────────────────────────────────────
Write-Host "[6/6] Checking ADB device connection..." -ForegroundColor Yellow
$devices = adb devices 2>&1
Write-Host $devices
if ($devices -match "device$") {
    Write-Host "      ✓ Android device detected" -ForegroundColor Green
} else {
    Write-Host "      ⚠ No device found. Plug in phone with USB Debugging ON before building." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Setup complete! Next steps:" -ForegroundColor Cyan
Write-Host "  1. Fix any expo-doctor warnings" -ForegroundColor White
Write-Host "  2. Run: .\validate.ps1" -ForegroundColor White
Write-Host "  3. Run: npx expo prebuild --platform android --clean" -ForegroundColor White
Write-Host "  4. Run: npx expo run:android" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
