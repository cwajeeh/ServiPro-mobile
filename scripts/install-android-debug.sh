#!/usr/bin/env bash
# Installs debug APK via adb. Ignores extra argv (e.g. `yarn android:apk-debug rebuild`).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/android"
./gradlew assembleDebug
adb install -r "$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
