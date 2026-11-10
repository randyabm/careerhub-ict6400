# CareerHub Mobile

Android version of CareerHub, the Assessment 2 web application, built with
React Native and Expo for ICT6400 by Group 5.

It has the same five sections as the website (Home, Jobs, Resources, Dashboard
and Login) and reads the same `jobs.xml` and `resources.xml` files from GitHub
Pages over HTTPS.

## Install the APK

Connect an Android phone with USB debugging on, or start an emulator, then run:

```bash
adb install Group5_ICT6400_Assessment3_MobileApp.apk
```

The APK supports arm64 phones and x86_64 emulators. The minimum version is
Android 7.0 (API 24). The app needs an internet connection the first time it
opens.

## Build from source

You need Node.js, JDK 17 and the Android SDK. Gradle downloads any other Android
components it needs. Newer Java versions, such as Java 27, do not work with this
version of Gradle.

```bash
cd mobile
npm install
npx expo prebuild --platform android --clean
```

```bash
export JAVA_HOME=/path/to/jdk-17
export ANDROID_HOME=$HOME/Android/Sdk
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64
```

The APK is created at `android/app/build/outputs/apk/release/app-release.apk`.
It is signed with the default debug key, which is fine for marking but not for
publishing on Google Play.

The app does not use Expo Go. The Metro development server also uses `http://`,
which the release build blocks, so always test a release build.

## Tests

```bash
npm test
```

These tests check the XML parsing, search, recommendations and login rules
against the real data files. The tests on a phone are recorded in
[Test_Log.md](Test_Log.md).

## HTTPS

- `src/data/api.js` only requests `https://` addresses.
- `plugins/withHttpsOnly.js` adds a network security config that blocks
  cleartext traffic for every domain, and sets `usesCleartextTraffic="false"`.
- If a file cannot be loaded, the screen shows an error message and a
  **Try again** button.

## Project structure

| Path | Purpose |
| --- | --- |
| `App.js` | Starts the app and defines the five bottom tabs |
| `src/screens/` | One file for each tab |
| `src/components/` | Buttons, chips, cards, job card and bottom sheet |
| `src/lib/careerhub.js` | XML parsing, filters, recommendations and login rules |
| `src/data/api.js` | Loads the XML files over HTTPS |
| `src/state/AppContext.js` | Shared data, saved and applied job ids, and session |
| `src/theme.js` | Colours copied from the website stylesheet |
| `plugins/withHttpsOnly.js` | Adds the HTTPS-only rule to every Android build |
| `tests/` | Automated tests for the rules in `src/lib` |

## Limits

As in Assessment 2, this is a front-end prototype. There is no server or
database, so saved jobs stay on the device and the login form only checks the
format of the details. CareerHub does not save or send the password, but on
recent Android versions the phone's own password manager may offer to save it.
