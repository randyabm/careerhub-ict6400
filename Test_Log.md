# CareerHub - test log

Evidence for Section 4 of the group report. Every result below was read back out of the running
application in Chrome, not written from expectation.

**Date:** 16 October 2026
**Build:** `03_Build`
**Method:** each page served from `http://127.0.0.1:5500/`, viewport set with the browser's device
metrics override, and DOM values read back and compared with the expected result. Every test below
was run against the finished build, after the two fixes recorded in section 3.

---

## 1. Functional tests

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| T01 | Open the Home page | Page loads with its three help cards | 3 cards, 5 navigation links, no error notice | Pass |
| T02 | Open the Jobs page | Cards are built from the XML file | 10 cards rendered from `data/jobs.xml` | Pass |
| T03 | Job type options come from the data | Only types present in the file are offered | Any, Casual, Internship, Part-time | Pass |
| T04 | Category filters come from the data | One chip per category plus All | 8 chips | Pass |
| T05 | Keyword search | Matching jobs only | `intern` returned 1 of 10 | Pass |
| T06 | Job type filter | Matching jobs only | `Casual` returned 4 of 10 | Pass |
| T07 | Save a job | Button changes and the id is stored | Button became Saved, `careerhub.savedJobs` = `["J001"]` | Pass |
| T08 | Apply for a job | Button changes and the id is stored | Button became Applied and disabled, `careerhub.appliedJobs` = `["J001"]` | Pass |
| T09 | Job Details popup | Opens with the full record | Opened, title Customer Service Assistant | Pass |
| T10 | Close the popup | Popup closes | Closed on the Close button | Pass |
| T11 | Saved job after a reload | Still marked as saved | Card still shows Saved with the highlight border | Pass |
| T12 | Open the Resources page | Cards are built from the XML file | 8 cards rendered from `data/resources.xml` | Pass |
| T13 | Resource category filter | Matching resources only | Interview Preparation returned 2 of 8 | Pass |
| T14 | Learn more | Opens the article text from the XML | Opened with 489 characters of body text | Pass |
| T15 | Dashboard counts on first visit | Correct without visiting the Jobs page first | Saved 0, Applied 0, Recommended 3 | Pass |
| T16 | Dashboard counts with saved data | Match what is in storage | Saved 2, Applied 1, Recommended 3 | Pass |
| T17 | View Saved Jobs | Panel lists the saved jobs | Listed 2 jobs, in the order they were saved | Pass |
| T18 | Empty Saved Jobs panel | Explains that nothing is saved | "Nothing saved yet. Open the Jobs page and save an opportunity to see it here." | Pass |
| T19 | Empty Applications panel | Explains that nothing is applied for | "No applications yet. Apply for an opportunity from the Jobs page." | Pass |
| T20 | My Profile | Shows the details the prototype holds | Name, email, course, institute and the two counts | Pass |
| T21 | View Recommendations | Suggestions built from the saved categories | 3 suggestions, none of them already saved or applied for | Pass |
| T22 | Hide the panel | Panel closes | Hidden | Pass |
| T23 | Login, empty form | Both fields report an error | "Enter your email address." and "Enter your password." | Pass |
| T24 | Login, invalid input | Shape errors shown | "That does not look like an email address." and "Your password is at least 8 characters." | Pass |
| T25 | Login, focus handling | Focus moves to the first problem | Focus moved to the email field | Pass |
| T26 | Create an account link | Explains the limitation, no dead end | Inline message shown | Pass |
| T27 | Login, valid input | Reaches the dashboard | Redirected to `dashboard.html`, greeting built from the email | Pass |
| T28 | XML file missing | A clear message, not a blank page | `data/jobs.xml` renamed away, page showed "That data could not be loaded. Could not load data/jobs.xml (HTTP 404)", 0 cards, no result line. File restored after the test. | Pass |

## 2. Responsive tests

Viewport set with the device metrics override, then the computed grid and the navigation display read
back from the page.

| Width | Navigation | Card grid | Horizontal scroll |
|---|---|---|---|
| 390px | Collapsed, menu button visible | One column, 358px | None |
| 820px | Collapsed | Two columns, 384px each | None |
| 1440px | Horizontal, menu button hidden | Three columns, 360px each | None |

| ID | Test | Actual | Result |
|---|---|---|---|
| R01 | Menu button reports its state | `aria-expanded` true when open, false when closed | Pass |
| R02 | Menu closes after a second tap | Closed | Pass |
| R03 | No horizontal scrolling at any tested width | None at 390, 820 or 1440 | Pass |
| R04 | Buttons stay usable at 390px | All Save, Apply and Details buttons render with a usable width | Pass |

## 3. Defects found and fixed

Both were found by running the pages and reading values back. Neither is visible from reading the
source, which is the argument for testing the built application rather than the plan.

| # | Defect | Cause | Fix |
|---|---|---|---|
| D01 | On the **Home page** the mobile menu did not open at all. The same menu worked on every other page. Found by setting the viewport to 390px, tapping the button and reading `aria-expanded`, which stayed `false`. | `app.js` only wired the navigation when a page script asked it to, and `index.html` loads no page script. The function existed but nothing called it on that page. | `app.js` now initialises itself on `DOMContentLoaded`, and the shared setup is guarded so a page script reaching it a second time cannot wire the toggle twice and cancel itself out. |
| D02 | Opening **Saved Jobs or Applications with nothing stored** showed a panel with a title and no content. Found by clearing storage and opening the panel, which returned an empty string. | The empty-state sentence was passed as a **third** argument to a function that takes two, so it was silently dropped. A wrong-argument-count call, not a missing feature. | The sentence is passed into the list builder, which is the function that actually renders the empty state. |

## 4. What is not covered here

- **Firefox and Edge were not run.** The plan lists two browsers and the report must not claim
  cross-browser testing until a second engine has actually been used.
- **No screen reader testing.** The accessibility statements in the report are limited to what was
  checked here: real `<label>` elements, visible focus, heading order, `aria-live` regions and
  keyboard access to the menu.
- **No load or performance testing.** The application reads two local files of a few kilobytes.
- **No automated test suite.** The checks above are manual and repeatable, which is what the brief
  asks for, but they are not a regression suite.

## 5. How to repeat these tests

1. Open the folder in VS Code and start Live Server, or run `python3 -m http.server 5500`.
2. Open the browser's developer tools and turn on the device toolbar.
3. Set the width to 390, 820 and 1440 and check the navigation and the card columns against the table
   in section 2.
4. On the Jobs page, search, filter, save one job and apply for another, then open the Dashboard and
   confirm the counts and the panels.
5. Clear the site data in the browser and reload the Dashboard to check the empty states.

## 6. Hosted version

The same files are published as a static site from the group's GitHub repository:

    https://randyabm.github.io/careerhub-ict6400/

GitHub Pages serves the folder over HTTPS from the repository root, so the application runs from a
link with nothing installed locally. The published copy was checked in the same way as the local one:

| Check | Actual | Result |
|---|---|---|
| `data/jobs.xml` served over HTTPS | HTTP 200, `application/xml`, 7588 bytes, correct content | Pass |
| Jobs page builds its cards from the XML | 10 cards, 8 category chips, no error notice | Pass |
| Keyword search | `tutor` returned 1 of 10 | Pass |
| Save a job | `careerhub.savedJobs` = `["J001"]` | Pass |
| Dashboard counts and panel | Saved 1, panel listed Customer Service Assistant | Pass |
| Resources page and popup | 8 cards, popup opened with the XML body text | Pass |
| Login validation | Empty form reported "Enter your email address." | Pass |
| Login redirect under a subpath | Reached `/careerhub-ict6400/dashboard.html` | Pass |
| Mobile navigation at 390px | Collapsed, opened on tap, `aria-expanded` true, one column, no sideways scroll | Pass |
| Browser console | No JavaScript errors on any page | Pass |

The site is served from a subpath rather than the domain root, which is a useful check in itself: every
path in the project is relative, so nothing breaks when the application is not at the top level. The
demonstration in class still runs from a local copy, so a network problem cannot interrupt it.

