/* ==========================================================================
   careerhub.js - the rules of the application
   ICT6400 Assessment 4 - CareerHub mobile

   This file has no React code. It is the mobile version of the logic in the
   web app (js/app.js, jobs.js, dashboard.js and login.js), so the phone and
   the website search, recommend and validate in the same way. Because it is
   plain JavaScript it can also be tested on its own (see tests/).
   ========================================================================== */

import { DOMParser } from '@xmldom/xmldom';

/* ---------- XML ---------- */

/* Browsers provide DOMParser, but React Native does not, so @xmldom/xmldom is
   used. Any parse problem is thrown so that the app shows an error message. */
export function parseXml(text, expectedRoot) {
  let doc;
  try {
    doc = new DOMParser({
      onError: (level, message) => {
        if (level !== 'warning') {
          throw new Error(message);
        }
      },
    }).parseFromString(text, 'application/xml');
  } catch (error) {
    throw new Error('The data file is not valid XML.');
  }

  /* A wrong page (for example a Wi-Fi login page) can still be valid markup,
     so the root element is checked as well. */
  if (!doc || !doc.documentElement || doc.documentElement.tagName !== expectedRoot) {
    throw new Error('The data file does not have the expected format.');
  }
  return doc;
}

function elements(node, tagName) {
  const found = node.getElementsByTagName(tagName);
  const result = [];
  for (let i = 0; i < found.length; i += 1) {
    result.push(found.item(i));
  }
  return result;
}

/* A web page collapses line breaks in text, but a React Native <Text> does
   not, so the white space from the XML layout is removed here. */
function cleanText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function field(node, tagName) {
  const element = elements(node, tagName)[0];
  return element ? cleanText(element.textContent) : '';
}

export function jobsFromXml(text) {
  const doc = parseXml(text, 'jobs');
  return elements(doc, 'job').map((job) => ({
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
    requirements: elements(job, 'requirement').map((item) => cleanText(item.textContent)),
  }));
}

export function resourcesFromXml(text) {
  const doc = parseXml(text, 'resources');
  return elements(doc, 'resource').map((resource) => ({
    id: resource.getAttribute('id'),
    title: field(resource, 'title'),
    category: field(resource, 'category'),
    icon: field(resource, 'icon'),
    summary: field(resource, 'summary'),
    body: field(resource, 'body'),
  }));
}

/* ---------- filters ---------- */

/* The distinct values of one field, in the order they first appear. */
function distinct(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))];
}

export function jobTypes(jobs) {
  return ['Any', ...distinct(jobs, 'type').sort()];
}

export function categories(items) {
  return ['All', ...distinct(items, 'category')];
}

/* Same rule as the web page: the text must appear in the title, organisation,
   location or category, and the type and category must match their filters. */
export function filterJobs(jobs, { query = '', type = 'Any', category = 'All' }) {
  const text = query.trim().toLowerCase();
  return jobs.filter((job) => {
    const haystack =
      `${job.title} ${job.organisation} ${job.location} ${job.category}`.toLowerCase();
    return (
      (text === '' || haystack.includes(text)) &&
      (type === 'Any' || job.type === type) &&
      (category === 'All' || job.category === category)
    );
  });
}

/* ---------- dashboard ---------- */

/* Keep the order the student acted in, not the order of the XML file. Ids
   with no matching job are dropped. */
export function jobsByIds(jobs, ids) {
  return ids.map((id) => jobs.find((job) => job.id === id)).filter(Boolean);
}

/* Suggest jobs from the categories already saved. If there are none, fall back
   to the opportunities closing soonest. Jobs already saved or applied for are
   never suggested. */
export function recommendedJobs(jobs, savedIds, appliedIds) {
  const wanted = new Set(jobsByIds(jobs, savedIds).map((job) => job.category));
  const pool = jobs.filter(
    (job) => !savedIds.includes(job.id) && !appliedIds.includes(job.id)
  );
  const matching = pool.filter((job) => wanted.has(job.category));
  const chosen = matching.length
    ? matching
    : [...pool].sort((a, b) => a.closing.localeCompare(b.closing));
  return chosen.slice(0, 3);
}

/* ---------- text ---------- */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December',
];

/* 2026-11-09 reads as 9 November 2026, the same as the web cards. */
export function formatDate(iso) {
  if (!iso) {
    return '';
  }
  const parts = iso.split('-');
  if (parts.length !== 3) {
    return iso;
  }
  return `${parseInt(parts[2], 10)} ${MONTHS[parseInt(parts[1], 10) - 1] || ''} ${parts[0]}`;
}

/* ---------- login ---------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
export const MIN_PASSWORD = 8;

/* Checks the shape of what was typed. It is not authentication: this project
   has no server, and the app says so on the Login screen. */
export function validateLogin(emailValue, password) {
  const email = emailValue.trim();
  const errors = { email: '', password: '' };

  if (email === '') {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'That does not look like an email address.';
  }

  if (password === '') {
    errors.password = 'Enter your password.';
  } else if (password.length < MIN_PASSWORD) {
    errors.password = `Your password is at least ${MIN_PASSWORD} characters.`;
  }
  return errors;
}

/* "shruti.chhetri@student.ozford.edu.au" becomes "Shruti Chhetri". */
export function displayNameFrom(email) {
  const name = email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
  return name || 'Student';
}
