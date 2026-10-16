/* ==========================================================================
   dashboard.js - the Student Dashboard page
   ICT6400 Assessment 2 - Ozford Student Career Hub

   The four dashboard cards each open a panel below them. Saved jobs and
   applications are read from localStorage; the job details behind those ids
   come from data/jobs.xml. Recommended jobs are worked out from the
   categories the student has already saved.
   ========================================================================== */

(function () {
  'use strict';

  var allJobs = [];
  var panelEl, panelTitleEl, panelBodyEl;

  function jobsById(ids) {
    /* Keep the order the student acted in, not the order of the XML file. */
    return ids.map(function (id) {
      return allJobs.filter(function (job) { return job.id === id; })[0];
    }).filter(Boolean);
  }

  /* The recommendation rule, kept deliberately simple and explainable:
     look at the categories of the jobs already saved, and suggest jobs from
     those categories that have not been saved or applied for. If the student
     has saved nothing yet, fall back to the opportunities closing soonest. */
  function recommendedJobs() {
    var saved = jobsById(CareerHub.getSaved());
    var applied = CareerHub.getApplied();
    var wanted = {};
    saved.forEach(function (job) { wanted[job.category] = true; });

    var pool = allJobs.filter(function (job) {
      return CareerHub.getSaved().indexOf(job.id) === -1 &&
             applied.indexOf(job.id) === -1;
    });

    var matching = pool.filter(function (job) { return wanted[job.category]; });
    var chosen = matching.length ? matching : pool.slice().sort(function (a, b) {
      return a.closing < b.closing ? -1 : 1;
    });

    return chosen.slice(0, 3);
  }

  function openPanel(title, html) {
    panelTitleEl.textContent = title;
    panelBodyEl.innerHTML = html;
    panelEl.hidden = false;
    panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function jobListHtml(jobs, emptyMessage) {
    if (!jobs.length) {
      return '<p class="empty">' + CareerHub.escape(emptyMessage) + '</p>';
    }
    return '<ul class="list">' + jobs.map(function (job) {
      return '<li>' +
        '<strong>' + CareerHub.escape(job.title) + '</strong>' +
        '<span>' + CareerHub.escape(job.organisation) + '</span>' +
        '<span>' + CareerHub.escape(job.location) + '</span>' +
        '<span class="tag tag--type">' + CareerHub.escape(job.type) + '</span>' +
        '<span>Closes ' + CareerHub.escape(CareerHub.formatDate(job.closing)) + '</span>' +
      '</li>';
    }).join('') + '</ul>';
  }

  function showProfile() {
    var session = CareerHub.getSession();
    openPanel('My Profile',
      '<ul class="profile-facts">' +
        '<li><span>Name</span>' + CareerHub.escape(session && session.name ? session.name : 'Not set yet') + '</li>' +
        '<li><span>Email</span>' + CareerHub.escape(session && session.email ? session.email : 'Not signed in') + '</li>' +
        '<li><span>Course</span>Master of Information Technology</li>' +
        '<li><span>Institute</span>Ozford Institute of Higher Education</li>' +
        '<li><span>Saved jobs</span>' + CareerHub.countSaved() + '</li>' +
        '<li><span>Applications</span>' + CareerHub.countApplied() + '</li>' +
      '</ul>' +
      '<p class="result-line">Education details come from the sample data. Editing the ' +
      'profile needs a server and a database, which is listed as out of scope for this prototype.</p>');
  }

  function showSaved() {
    openPanel('Saved Jobs',
      jobListHtml(jobsById(CareerHub.getSaved()),
        'Nothing saved yet. Open the Jobs page and save an opportunity to see it here.'));
  }

  function showApplications() {
    openPanel('Applications',
      jobListHtml(jobsById(CareerHub.getApplied()),
        'No applications yet. Apply for an opportunity from the Jobs page.'));
  }

  function showRecommended() {
    openPanel('Recommended Jobs',
      jobListHtml(recommendedJobs(), 'No further suggestions right now.') +
      '<p class="result-line">Suggestions are based on the categories of the jobs ' +
      'you have already saved.</p>');
  }

  function setCount(id, value) {
    var el = document.getElementById(id);
    if (el) { el.textContent = value; }
  }

  function start() {
    panelEl = document.getElementById('dashboard-panel');
    panelTitleEl = document.getElementById('panel-title');
    panelBodyEl = document.getElementById('panel-body');
    if (!panelEl) { return; }

    /* The greeting uses whatever the login form collected. It is a name, not
       an authenticated identity, and the report says so. */
    var session = CareerHub.getSession();
    var greeting = document.getElementById('dashboard-greeting');
    if (greeting && session && session.name) {
      greeting.textContent = 'Welcome back, ' + session.name;
    }

    document.getElementById('card-profile').addEventListener('click', showProfile);
    document.getElementById('card-saved').addEventListener('click', showSaved);
    document.getElementById('card-applied').addEventListener('click', showApplications);
    document.getElementById('card-recommended').addEventListener('click', showRecommended);

    document.getElementById('panel-hide').addEventListener('click', function () {
      panelEl.hidden = true;
    });

    CareerHub.loadXML(CareerHub.DATA_FILES.jobs).then(function (doc) {
      allJobs = CareerHub.jobsFrom(doc);
      setCount('count-saved', CareerHub.countSaved());
      setCount('count-applied', CareerHub.countApplied());
      setCount('count-recommended', recommendedJobs().length);
    }).catch(function (error) {
      CareerHub.showError(panelEl, error.message);
      panelEl.hidden = false;
    });
  }

  /* app.js wires the navigation and the dialog itself, so this only has to
     start the page. */
  document.addEventListener('DOMContentLoaded', start);
}());
