/* ==========================================================================
   resources.js - the Career Resources page
   ICT6400 Assessment 2 - Ozford Student Career Hub

   Builds the resource cards from data/resources.xml. Learn more opens the
   shared dialog with the full article, which is the copy held in the XML.
   ========================================================================== */

(function () {
  'use strict';

  var allResources = [];
  var activeCategory = 'All';
  var listEl, chipsEl, countEl;

  function categoryList() {
    var seen = {};
    var categories = ['All'];
    allResources.forEach(function (resource) {
      if (resource.category && !seen[resource.category]) {
        seen[resource.category] = true;
        categories.push(resource.category);
      }
    });
    return categories;
  }

  function buildChips() {
    categoryList().forEach(function (category) {
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

  function cardFor(resource) {
    var card = document.createElement('article');
    card.className = 'card';
    card.innerHTML =
      '<span class="card__icon" aria-hidden="true">' + resource.icon + '</span>' +
      '<h3>' + CareerHub.escape(resource.title) + '</h3>' +
      '<ul class="card__meta"><li class="tag">' + CareerHub.escape(resource.category) + '</li></ul>' +
      '<p>' + CareerHub.escape(resource.summary) + '</p>' +
      '<div class="card__actions">' +
        '<button type="button" class="btn btn--outline js-learn">Learn more</button>' +
      '</div>';

    card.querySelector('.js-learn').addEventListener('click', function () {
      CareerHub.openModal(resource.title, resource.category,
        '<p>' + CareerHub.escape(resource.body) + '</p>');
    });

    return card;
  }

  function render() {
    var visible = allResources.filter(function (resource) {
      return activeCategory === 'All' || resource.category === activeCategory;
    });

    listEl.innerHTML = '';
    if (!visible.length) {
      listEl.innerHTML = '<p class="empty">No resources in that category yet.</p>';
    } else {
      visible.forEach(function (resource) { listEl.appendChild(cardFor(resource)); });
    }

    if (countEl) {
      countEl.textContent = visible.length + ' of ' + allResources.length + ' resources shown.';
    }
  }

  function start() {
    listEl = document.getElementById('resource-list');
    chipsEl = document.getElementById('filter-categories');
    countEl = document.getElementById('result-count');
    if (!listEl) { return; }

    CareerHub.loadXML(CareerHub.DATA_FILES.resources).then(function (doc) {
      allResources = CareerHub.resourcesFrom(doc);
      buildChips();
      render();
    }).catch(function (error) {
      CareerHub.showError(listEl, error.message);
    });
  }

  /* app.js wires the navigation and the dialog itself, so this only has to
     start the page. */
  document.addEventListener('DOMContentLoaded', start);
}());
