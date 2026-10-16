/* ==========================================================================
   jobs.js - the Jobs page
   ICT6400 Assessment 2 - Ozford Student Career Hub

   Loads data/jobs.xml once, then filters and renders from the in-memory list.
   Every card is built from the XML record, so nothing on this page is typed
   into the HTML by hand.
   ========================================================================== */

(function () {
  'use strict';

  var allJobs = [];          /* every job from the XML file */
  var activeCategory = 'All';
  var listEl, countEl, searchEl, typeEl, chipsEl;

  function typeOptions() {
    var seen = {};
    var types = [];
    allJobs.forEach(function (job) {
      if (job.type && !seen[job.type]) { seen[job.type] = true; types.push(job.type); }
    });
    return types.sort();
  }

  function buildTypeSelect() {
    typeOptions().forEach(function (type) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeEl.appendChild(option);
    });
  }

  function buildCategoryChips() {
    var seen = {};
    var categories = ['All'];
    allJobs.forEach(function (job) {
      if (job.category && !seen[job.category]) { seen[job.category] = true; categories.push(job.category); }
    });

    categories.forEach(function (category) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = category;
      chip.setAttribute('aria-pressed', category === activeCategory ? 'true' : 'false');
      chip.addEventListener('click', function () {
        activeCategory = category;
        Array.prototype.forEach.call(chipsEl.children, function (other) {
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        render();
      });
      chipsEl.appendChild(chip);
    });
  }

  /* A job matches when the search text appears in the title, organisation or
     location, when the type either matches or the select is on Any, and when
     the category either matches or the chips are on All. */
  function matches(job, query, type) {
    var haystack = (job.title + ' ' + job.organisation + ' ' + job.location + ' ' +
                    job.category).toLowerCase();
    var textOk = query === '' || haystack.indexOf(query) !== -1;
    var typeOk = type === 'Any' || job.type === type;
    var categoryOk = activeCategory === 'All' || job.category === activeCategory;
    return textOk && typeOk && categoryOk;
  }

  function cardFor(job) {
    var saved = CareerHub.isSaved(job.id);
    var applied = CareerHub.isApplied(job.id);

    var card = document.createElement('article');
    card.className = 'card card--job' + (saved ? ' is-saved' : '');
    card.dataset.jobId = job.id;

    card.innerHTML =
      '<h3>' + CareerHub.escape(job.title) + '</h3>' +
      '<p class="job-org"><strong>' + CareerHub.escape(job.organisation) + '</strong></p>' +
      '<ul class="card__meta">' +
        '<li class="tag tag--type">' + CareerHub.escape(job.type) + '</li>' +
        '<li class="tag">' + CareerHub.escape(job.location) + '</li>' +
      '</ul>' +
      '<p>' + CareerHub.escape(job.summary) + '</p>' +
      '<ul class="card__meta">' +
        '<li class="tag">' + CareerHub.escape(job.hours) + '</li>' +
        '<li class="tag">Close ' + CareerHub.escape(CareerHub.formatDate(job.closing)) + '</li>' +
      '</ul>' +
      '<div class="card__actions">' +
        '<button type="button" class="btn btn--outline js-save">' + (saved ? 'Saved' : 'Save') + '</button>' +
        '<button type="button" class="btn btn--solid js-apply"' + (applied ? ' disabled' : '') + '>' +
          (applied ? 'Applied' : 'Apply') + '</button>' +
        '<button type="button" class="btn btn--ghost js-details">Details</button>' +
      '</div>';

    card.querySelector('.js-save').addEventListener('click', function (event) {
      var nowSaved = CareerHub.toggleSaved(job.id);
      event.currentTarget.textContent = nowSaved ? 'Saved' : 'Save';
      card.classList.toggle('is-saved', nowSaved);
    });

    card.querySelector('.js-apply').addEventListener('click', function (event) {
      CareerHub.markApplied(job.id);
      event.currentTarget.textContent = 'Applied';
      event.currentTarget.disabled = true;
    });

    card.querySelector('.js-details').addEventListener('click', function () {
      var requirements = job.requirements.length
        ? '<h3>What they are looking for</h3><ul>' +
          job.requirements.map(function (item) {
            return '<li>' + CareerHub.escape(item) + '</li>';
          }).join('') + '</ul>'
        : '';
      CareerHub.openModal(
        job.title,
        job.organisation + ' \u00b7 ' + job.location,
        '<ul class="card__meta">' +
          '<li class="tag tag--type">' + CareerHub.escape(job.type) + '</li>' +
          '<li class="tag">' + CareerHub.escape(job.hours) + '</li>' +
          '<li class="tag">' + CareerHub.escape(job.rate) + '</li>' +
        '</ul>' +
        '<p>' + CareerHub.escape(job.summary) + '</p>' + requirements +
        '<p><strong>Applications close:</strong> ' + CareerHub.escape(CareerHub.formatDate(job.closing)) + '</p>'
      );
    });

    return card;
  }

  function render() {
    var query = searchEl.value.trim().toLowerCase();
    var type = typeEl.value;
    var visible = allJobs.filter(function (job) { return matches(job, query, type); });

    listEl.innerHTML = '';

    if (!visible.length) {
      listEl.innerHTML = '<p class="empty">No opportunities match that search. ' +
        'Try a different keyword, or set the job type back to Any.</p>';
    } else {
      visible.forEach(function (job) { listEl.appendChild(cardFor(job)); });
    }

    countEl.textContent = visible.length + ' of ' + allJobs.length +
      ' opportunities shown. Saved jobs: ' + CareerHub.countSaved() +
      '. Applications: ' + CareerHub.countApplied() + '.';
  }

  function start() {
    listEl = document.getElementById('job-list');
    countEl = document.getElementById('result-count');
    searchEl = document.getElementById('search-jobs');
    typeEl = document.getElementById('filter-type');
    chipsEl = document.getElementById('filter-categories');
    if (!listEl) { return; }

    /* The form is submitted either by the Search Jobs button or by pressing
       Enter in the input, so both go through the same handler. */
    document.getElementById('search-form').addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    typeEl.addEventListener('change', render);
    searchEl.addEventListener('input', render);

    CareerHub.loadXML(CareerHub.DATA_FILES.jobs).then(function (doc) {
      allJobs = CareerHub.jobsFrom(doc);
      buildTypeSelect();
      buildCategoryChips();
      render();
    }).catch(function (error) {
      CareerHub.showError(listEl, error.message);
      countEl.textContent = '';
    });
  }

  /* app.js wires the navigation and the dialog itself, so this only has to
     start the page. */
  document.addEventListener('DOMContentLoaded', start);
}());
