# CareerHub Mobile: Test Log

## Test setup

| Item | Value |
| --- | --- |
| Date | 10 November 2026 |
| Device | Google Pixel 7 Pro, connected by USB debugging |
| Android version | Android 17 (API 37) |
| Build | Release APK, version 1.0.0, Expo SDK 58, React Native 0.88 |
| Method | Screens driven with `adb shell input`. Results read from the screen hierarchy with `uiautomator`. Screenshots taken with `adb exec-out screencap` |
| Data source | `https://randyabm.github.io/careerhub-ict6400/data/` |

## Results

| # | Area | Check | Result |
| --- | --- | --- | --- |
| 1 | Home | Hero and three feature cards are shown | Pass |
| 2 | Home, HTTPS | Explore Jobs opens Jobs, and 10 jobs load from GitHub Pages | Pass |
| 3 | Jobs | Keyword search filters while typing (southbank: 1 of 10) | Pass |
| 4 | Jobs | A search with no match shows the empty message | Pass |
| 5 | Jobs | Clearing the search brings back all 10 jobs | Pass |
| 6 | Jobs | Job type filter (Internship: 2 of 10) | Pass |
| 7 | Jobs | Category filter (Hospitality and Events: 1 of 10) | Pass |
| 8 | Jobs | Save changes the button and the counter | Pass |
| 9 | Jobs | Apply changes the button and the counter | Pass |
| 10 | Jobs | Applied button is disabled | Pass |
| 11 | Jobs | Details sheet shows rate, requirements and closing date | Pass |
| 12 | Jobs | Android back button closes the sheet | Pass |
| 13 | Resources | 8 guides are listed | Pass |
| 14 | Resources | Learn more opens the full article | Pass |
| 15 | Resources | Close button closes the reader | Pass |
| 16 | Resources | Category filter (Resume and CV: 2 of 8) | Pass |
| 17 | Dashboard | Greeting and live counts are shown | Pass |
| 18 | Dashboard | Saved panel lists the saved job | Pass |
| 19 | Dashboard | Applications panel lists the job | Pass |
| 20 | Dashboard | Recommendations appear and exclude the saved job | Pass |
| 21 | Dashboard | Profile shows "Not signed in" before login | Pass |
| 22 | Login | Create an account explains that it is out of scope | Pass |
| 23 | Login | Empty form shows both error messages | Pass |
| 24 | Login | Cursor moves to the first field with a problem | Pass |
| 25 | Login | An error clears when the student starts typing | Pass |
| 26 | Login | A bad email and a short password are rejected | Pass |
| 27 | Login | Valid login opens Dashboard and greets the student by name | Pass |
| 28 | Storage | Saved and applied jobs remain after the app is closed | Pass |
| 29 | Session | Login session ends when the app is closed | Pass |
| 30 | Error state | Offline with no stored copy, Jobs shows the error and Try again | Pass |
| 31 | Error state | Offline with no stored copy, Resources shows the error | Pass |
| 32 | Error state | Try again loads the data once the phone is back online | Pass |
| 33 | HTTPS | Closing dates changed in the published `jobs.xml` appear in the app without a new build | Pass |

Automated tests on a computer (`npm test`): 12 of 12 passed.

## HTTPS evidence

- `aapt2` on the final APK shows `usesCleartextTraffic=false` and a
  `networkSecurityConfig` entry.
- The network security config sets `cleartextTrafficPermitted="false"`.
- `curl` confirmed that the data files are served over HTTP/2 with HSTS, and
  that the `http://` address redirects with a 301.
- The only permission in the final APK is `INTERNET`, apart from one that
  Android adds for the app's own internal use.

## Defects found and fixed

1. **Technical text in the offline message.** With no connection the screen
   showed `fetch failed: java...`. `api.js` expected a JavaScript `TypeError`,
   but React Native gave a different error. All connection failures now show
   "The secure connection could not be made."
2. **Line breaks in job text.** A web page collapses line breaks but a React
   Native `Text` does not. The parser now removes the white space from the XML
   layout. This was found while porting the code, and a test covers it.

## Known behaviour

- **Short offline periods.** If the app loaded the data in the last 10 minutes,
  it can show the stored copy while offline. GitHub Pages allows this caching.
  The error appears when there is no valid stored copy, so checks 30 and 31
  were run after clearing the app data.
- **Password manager prompt.** On this phone Google Password Manager offered to
  save the password when the form was left with text in it. Autofill is off for
  both fields, but Android still showed the prompt. The app itself does not save
  the password. During testing the prompt was closed without saving.

## Not covered

- Android blocking a real `http://` request at run time was not tested, because
  the app has no way to make one. The evidence is the manifest and configuration
  above.
- The x86_64 build was not run on an emulator.
- Only one device and Android version were tested.
- No screen reader testing was done.
