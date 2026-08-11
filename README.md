# Servisca (React Native CLI)

Mobile app for Servisca, built with **React Native 0.83** and the **React Native CLI** workflow (not Expo Go).

## Prerequisites

- **Node.js** + **Yarn** (v1 classic)
- **Xcode** (iOS) and **CocoaPods** (`pod install` in `ios/`)
- **Android Studio** + **JDK 17** (Android)
- **Android:** `android/app/google-services.json` (download from Firebase; package must be `com.facilcod.app`). **iOS:** `ios/servisca/GoogleService-Info.plist` (in Xcode target). After adding native Firebase packages, run **`cd ios && pod install`** and **rebuild** the app (Expo Go never ran this native stack — use a dev/release build here).

Use **`yarn.lock`** as the source of truth. If you still have a root `package-lock.json` from npm, remove it to avoid mixed lockfiles.

## Environment

Copy `.env.example` to `.env`. Native builds use **`react-native-config`** (see `src/config/nativeEnv.ts`). Use the variable names in `.env.example` (for example `API_URL`, `GOOGLE_WEB_CLIENT_ID` — not Expo-style `EXPO_PUBLIC_*` prefixes).

GitHub Actions: the Android APK workflow writes `API_URL` and `MEDIA_BASE_URL` from repository **Variables** `API_URL` and `MEDIA_BASE_URL` (defaults are production/staging URLs in the workflow file).

## Install & run

```bash
yarn install
cd ios && pod install && cd ..
yarn start
```

In another terminal:

```bash
yarn ios
# or
yarn android
```

The JS entry is **`index.js`**, which registers the **`main`** component (`android` / iOS must use the same name).

**Android (New Architecture):** If `./gradlew clean` fails with CMake errors about missing `codegen/jni`, skip `clean` and remove native caches instead: `rm -rf android/app/.cxx android/app/build android/build`, then `yarn android`.

**Emulator `INSTALL_FAILED_INSUFFICIENT_STORAGE`:** The debug APK is large; free space or use a smaller ABI set (`android/gradle.properties` → `reactNativeArchitectures`). Run `adb uninstall com.facilcod.app`, then either `yarn android` again or `yarn android:apk-debug` (build + `adb install -r`). Wipe the AVD in Device Manager if it still fails.

## Scripts

| Script              | Description          |
| ------------------- | -------------------- |
| `yarn start`        | Metro bundler        |
| `yarn ios`          | Build & run iOS      |
| `yarn android`      | Build & run Android  |
| `yarn android:apk-debug` | Assemble debug APK + `adb install -r` (if `run-android` install fails) |
| `yarn lint`         | ESLint               |
| `yarn test`         | Jest                 |
| `yarn typecheck`    | TypeScript (no emit) |

## Legacy reset script

`yarn reset-project` is a destructive template helper. Prefer git to restore code.

## Spec alignment (marketplace MVP)

This app is the **React Native CLI** source of truth for Servisca mobile (see also Cursor workspace copy under `React Native/servisca`, which may be incomplete / Expo-hybrid — prefer this repo).

### Wired (current)

- Auth: email/password, OTP, Google/Apple → API
- Customer: home, create task, bidding accept/reject, bookings, notifications, profile/uploads
- Tasker: online toggle, find jobs, bidding list, place bid, job detail accept/reject/ignore, history, wallet stats, chat (`/chat` socket)
- Tokens: EncryptedStorage + refresh interceptor
- Sockets: `/notifications`, `/task-stream`, `/chat`

### Remaining gaps

- Customer matching still uses transitional UX (not full live match stream)
- Live GPS tracking map (`/live-location`) not fully wired end-to-end
- Job status machine UI (on the way → arrived → started → invoice) partially via sockets; deepen on job detail
- Stripe invoice pay & company B2B onboarding are P1/P2

Brand tokens: `#19317C` / `#001A6D` in `src/constants/theme.ts` (`Brand`, `AuthPalette`).
