# CareerHub - Ozford Student Career Hub

Responsive web application prototype for **ICT6400 Assessment 2, Web Programming Project**,
Trimester 2 2026. Group: Shruti Thapa Chhetri, Sushan Shahi and Randy Arlon Beltran Martinez.
Student IDs appear on the cover sheet of the submitted report, not in this file.

CareerHub brings student job search, career preparation resources and application tracking into one
place, instead of spreading them across job boards, document editors and notes.

---

## How to run it

The application reads its data from XML files with `fetch()`. Browsers block that on `file://` URLs,
so the pages have to be served over HTTP. Any of these works:

**Option 1, VS Code Live Server (what the demonstration uses)**

1. Open this folder in VS Code.
2. Install the **Live Server** extension if it is not already there.
3. Right click `index.html` and choose **Open with Live Server**.
4. The browser opens at `http://127.0.0.1:5500/index.html`.

**Option 2, Python**

```bash
cd 03_Build
python3 -m http.server 5500
```

Then open `http://127.0.0.1:5500/index.html`.

There is nothing to install and no build step. If a page shows a red message saying the data could
not be loaded, the folder is being opened as a file rather than through a server.

**Option 3, the hosted version**

The same files are published as a static site, so the application can be opened from a link without
setting anything up:

    https://randyabm.github.io/careerhub-ict6400/

The demonstration in class runs from a local copy, so a slow or missing network connection cannot
interrupt it. The hosted link is there to show the application running over HTTPS and on a device
that has no local copy.

---

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | Introduces CareerHub and links to the main sections |
| Jobs | `jobs.html` | Keyword search, job type select, category filters, job cards with Save, Apply and Details |
| Resources | `resources.html` | Career guides filtered by category, each opening in a detail popup |
| Dashboard | `dashboard.html` | Profile summary, saved jobs, applications and recommendations |
| Login | `login.html` | Email and password form with client-side validation |

---

## Folder structure

```
03_Build/
├── index.html          Home
├── jobs.html           Jobs and search
├── resources.html      Career resources
├── dashboard.html      Student dashboard
├── login.html          Student login
├── css/
│   └── styles.css      All styling and the responsive layer
├── js/
│   ├── app.js          Shared: XML loading, storage, navigation, modal
│   ├── jobs.js         Jobs page: search, filter, save, apply, details
│   ├── resources.js    Resources page: cards and popups
│   ├── dashboard.js    Dashboard: counts, panels, recommendations
│   └── login.js        Login form validation
├── data/
│   ├── jobs.xml        Ten sample job records
│   └── resources.xml   Eight sample career resources
└── README.md
```

---

## The XML data layer

Two files hold all the sample content, so the HTML carries no job or resource copy of its own.

**`data/jobs.xml`** holds one `<job>` element per vacancy:

```xml
<job id="J003">
  <title>Junior IT Intern</title>
  <organisation>Collins Street Software</organisation>
  <location>Melbourne CBD, VIC</location>
  <type>Internship</type>
  <category>Information Technology</category>
  <hours>Two days per week for 12 weeks</hours>
  <rate>$27 per hour</rate>
  <closing>2026-11-02</closing>
  <summary>Support role inside a small product team...</summary>
  <requirements>
    <requirement>Currently studying an IT degree</requirement>
  </requirements>
</job>
```

**`data/resources.xml`** holds one `<resource>` element per guide, with the article text in `<body>`.

The application loads a file with `fetch()`, parses it with `DOMParser`, and turns the elements into
plain objects (`CareerHub.jobsFrom()` and `CareerHub.resourcesFrom()` in `js/app.js`). The page
scripts then filter and render from those objects. Only job and resource **ids** are stored in the
browser, so the data always comes from the XML file.

---

## Responsive behaviour

The breakpoints come from the Assessment 1 design and are defined in `css/styles.css`:

| Width | Navigation | Card grids |
|---|---|---|
| up to 767px | Collapsed behind the menu button | One column |
| 768px to 1023px | Collapsed | Two columns |
| 1024px and up | Horizontal, always visible | Three columns |

To see the change, resize the browser window past 767px and 1023px, or use the device toolbar in
developer tools.

---

## What is stored in the browser

| Key | Storage | Holds |
|---|---|---|
| `careerhub.savedJobs` | localStorage | Ids of saved jobs, kept between visits |
| `careerhub.appliedJobs` | localStorage | Ids of jobs applied for |
| `careerhub.session` | sessionStorage | The email entered at login, for the dashboard greeting |

Clearing the browser data for the site clears all three.

---

## Known limitations

These are deliberate and documented in the report:

- No server and no database. Saved jobs and applications live in this browser only.
- The login form checks the shape of the input. It is not authentication, and no password is stored.
- Recommendations are a simple rule based on the categories already saved, not a real matching model.
- Profile details are fixed sample values; editing them needs a database.
- Account creation, an employer portal and live job listings are out of scope.

---

## Accessibility notes

- Every page has a skip link and a single `<h1>`.
- The menu button exposes its state through `aria-expanded`.
- Form fields have real `<label>` elements, and validation messages are announced with `aria-live`.
- Search results are announced politely as the count changes.
- Focus is visible on every interactive element.
- The layout survives 200% zoom, and motion is disabled when the system asks for reduced motion.
