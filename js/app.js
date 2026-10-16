/* ==========================================================================
   app.js - the pieces every page shares
   ICT6400 Assessment 2 - Ozford Student Career Hub

   Nothing in here touches a specific page's markup. The page scripts
   (jobs.js, resources.js, dashboard.js, login.js) call into this module, so
   the XML loading, the storage keys and the layout helpers are defined once.
   ========================================================================== */

var CareerHub = (function () {
  'use strict';

  /* Where the XML data lives. Both files sit in data/ next to the pages, so
     the paths are relative and the whole folder can be moved as one unit. */
  var DATA_FILES = {
    jobs: 'data/jobs.xml',
    resources: 'data/resources.xml'
  };

  /* Two keys, so a job can be saved without being applied for, and the other
     way round. Only the job id is stored: the job itself stays in the XML. */
  var KEYS = {
    saved: 'careerhub.savedJobs',
    applied: 'careerhub.appliedJobs',
    session: 'careerhub.session'
  };

  /* ---------- XML ---------- */

  /* Fetch an XML file and hand back a parsed Document.
     Browsers refuse XMLHttpRequest on file:// URLs, which is why the README
     tells you to open the project through Live Server rather than double
     clicking index.html. */
  function loadXML(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error('Could not load ' + path + ' (HTTP ' + response.status + ')');
      }
      return response.text();
    }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, 'application/xml');
      if (doc.querySelector('parsererror')) {
        throw new Error('The file ' + path + ' is not valid XML');
      }
      return doc;
    });
  }

  /* Read one child element's text. Missing elements return an empty string
     rather than undefined, so a short record never prints "undefined". */
  function field(node, tagName) {
    var el = node.querySelector(tagName);
    return el ? el.textContent.trim() : '';
  }

  /* Read a repeated child element, such as every <requirement> in a job. */
  function list(node, tagName) {
    return Array.prototype.map.call(node.querySelectorAll(tagName), function (el) {
      return el.textContent.trim();
    });
  }

  /* The two XML shapes as plain objects, so the page scripts never walk the
     DOM themselves. */
  function jobsFrom(doc) {
    return Array.prototype.map.call(doc.querySelectorAll('job'), function (job) {
      return {
        id: job.getAttribute('id'),
        title: field(job, 'title'),
        organisation: field(job, 'organisation'),
        location: field(job, 'location'),
        type: field(job, 'type'),
        category: field(job, 'category'),
        hours: field(job, 'hours'),
        rate: field(job, 'rate'),
        closing: field(job, 'closing'),
        summary: field(job, 'summary'),
        requirements: list(job, 'requirement')
      };
    });
  }

  function resourcesFrom(doc) {
    return Array.prototype.map.call(doc.querySelectorAll('resource'), function (resource) {
      return {
        id: resource.getAttribute('id'),
        title: field(resource, 'title'),
        category: field(resource, 'category'),
        icon: field(resource, 'icon'),
        summary: field(resource, 'summary'),
        body: field(resource, 'body')
      };
    });
  }

  /* ---------- storage ---------- */

  /* localStorage throws in some privacy modes, so every access is guarded and
     the application keeps working for the session instead of failing. */
  function readArray(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeArray(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function getSaved() { return readArray(KEYS.saved); }
  function getApplied() { return readArray(KEYS.applied); }
  function isSaved(id) { return getSaved().indexOf(id) !== -1; }
  function isApplied(id) { return getApplied().indexOf(id) !== -1; }

  /* Saving and applying both return the new state so the button that called
     them can update itself without reading storage again. */
  function toggleSaved(id) {
    var saved = getSaved();
    var index = saved.indexOf(id);
    if (index === -1) { saved.push(id); } else { saved.splice(index, 1); }
    writeArray(KEYS.saved, saved);
    return index === -1;
  }

  function markApplied(id) {
    var applied = getApplied();
    if (applied.indexOf(id) === -1) {
      applied.push(id);
      writeArray(KEYS.applied, applied);
    }
    return true;
  }

  function countSaved() { return getSaved().length; }
  function countApplied() { return getApplied().length; }

  /* The session is only what the login form collected. It is deliberately
     not authentication: there is no server in this prototype. */
  function getSession() {
    try {
      var raw = window.sessionStorage.getItem(KEYS.session);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function setSession(value) {
    try {
      window.sessionStorage.setItem(KEYS.session, JSON.stringify(value));
    } catch (error) {
      /* non-fatal: the dashboard falls back to a generic greeting */
    }
  }

  /* ---------- text and dates ---------- */

  /* Job titles and resource copy come from a file, so anything written into
     the page is escaped. It costs nothing and it keeps the promise the report
     makes about cross-site scripting. */
  function escape(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* 2026-11-09 reads as 9 November 2026, which is what the cards show. */
  function formatDate(iso) {
    if (!iso) { return ''; }
    var parts = iso.split('-');
    if (parts.length !== 3) { return iso; }
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                  'August', 'September', 'October', 'November', 'December'];
    var month = months[parseInt(parts[1], 10) - 1] || '';
    return parseInt(parts[2], 10) + ' ' + month + ' ' + parts[0];
  }

  /* ---------- shared layout behaviour ---------- */

  /* The collapsed navigation. aria-expanded on the button is the single
     source of truth, so the visual state and the accessible state cannot
     disagree. */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) { return; }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* Following a link on a narrow screen should close the menu again. */
    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A' && window.matchMedia('(max-width: 1023px)').matches) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* One dialog element is reused for job details and for resource articles. */
  function openModal(title, category, bodyHtml) {
    var modal = document.getElementById('detail-modal');
    if (!modal) { return; }
    document.getElementById('detail-modal-title').textContent = title;
    document.getElementById('detail-modal-category').textContent = category || '';
    document.getElementById('detail-modal-body').innerHTML = bodyHtml;
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', 'open');   /* fallback for older engines */
    }
  }

  function initModal() {
    var modal = document.getElementById('detail-modal');
    if (!modal) { return; }
    modal.addEventListener('click', function (event) {
      /* Clicking the backdrop closes: the dialog box itself is the child. */
      if (event.target === modal) { modal.close(); }
    });
    /* The close button lives in the page markup, so it is bound here rather
       than with an inline onclick attribute. */
    var close = modal.querySelector('.modal__close');
    if (close) {
      close.addEventListener('click', function () { modal.close(); });
    }
  }

  /* Shown when an XML file cannot be read, instead of an empty page. */
  function showError(container, message) {
    if (!container) { return; }
    container.innerHTML =
      '<div class="notice notice--error" role="alert">' +
      '<strong>That data could not be loaded.</strong> ' + escape(message) +
      '<br>Check that the project is running from a web server, not opened as a file.' +
      '</div>';
  }

  var initialised = false;

  /* Guarded, because app.js and a page script can both reach this. The mobile
     navigation and the dialog must be wired exactly once, or the toggle would
     end up toggling twice per tap and appear not to work. */
  function init() {
    if (initialised) { return; }
    initialised = true;
    initNav();
    initModal();
  }

  /* app.js is loaded by every page, including the Home page, which has no page
     script of its own. Initialising from here means the navigation works
     everywhere rather than only on the pages that remembered to ask. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    DATA_FILES: DATA_FILES,
    loadXML: loadXML,
    jobsFrom: jobsFrom,
    resourcesFrom: resourcesFrom,
    getSaved: getSaved,
    getApplied: getApplied,
    isSaved: isSaved,
    isApplied: isApplied,
    toggleSaved: toggleSaved,
    markApplied: markApplied,
    countSaved: countSaved,
    countApplied: countApplied,
    getSession: getSession,
    setSession: setSession,
    escape: escape,
    formatDate: formatDate,
    openModal: openModal,
    showError: showError,
    init: init
  };
}());
