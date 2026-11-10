/* Tests for the application rules, run against the real XML files in the
   repository. Run with: npm test */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  categories,
  displayNameFrom,
  filterJobs,
  formatDate,
  jobTypes,
  jobsByIds,
  jobsFromXml,
  parseXml,
  recommendedJobs,
  resourcesFromXml,
  validateLogin,
} from '../src/lib/careerhub.js';

const read = (name) => readFileSync(new URL(`../../data/${name}`, import.meta.url), 'utf8');
const jobs = jobsFromXml(read('jobs.xml'));
const resources = resourcesFromXml(read('resources.xml'));

test('reads all ten jobs with their fields', () => {
  assert.equal(jobs.length, 10);
  const first = jobs[0];
  assert.equal(first.id, 'J001');
  assert.equal(first.title, 'Customer Service Assistant');
  assert.equal(first.rate, '$28 to $32 per hour');
  assert.equal(first.requirements.length, 3);
});

test('text from the XML layout has no line breaks', () => {
  for (const job of jobs) {
    assert.doesNotMatch(job.summary, /\s{2,}|\n/);
  }
});

test('reads all eight resources and decodes the emoji icons', () => {
  assert.equal(resources.length, 8);
  assert.equal(resources[0].icon, '\u{1F4C4}');
});

test('rejects broken XML and the wrong kind of document', () => {
  assert.throws(() => parseXml('<jobs><job></jobs>', 'jobs'));
  assert.throws(() => parseXml('', 'jobs'));
  assert.throws(() => parseXml('<html><body>Sign in to Wi-Fi</body></html>', 'jobs'));
});

test('builds the filter options from the data', () => {
  assert.deepEqual(jobTypes(jobs), ['Any', 'Casual', 'Internship', 'Part-time']);
  assert.equal(categories(jobs)[0], 'All');
  assert.equal(new Set(categories(jobs)).size, categories(jobs).length);
});

test('searches case-insensitively and combines the filters', () => {
  assert.ok(filterJobs(jobs, { query: 'SOUTHBANK' }).length > 0);
  assert.equal(filterJobs(jobs, { query: 'zzzz' }).length, 0);
  assert.equal(filterJobs(jobs, {}).length, 10);
  const casual = filterJobs(jobs, { type: 'Casual' });
  assert.ok(casual.length > 0 && casual.every((job) => job.type === 'Casual'));
  const both = filterJobs(jobs, { type: 'Internship', category: 'Information Technology' });
  assert.ok(both.every((job) => job.type === 'Internship' && job.category === 'Information Technology'));
});

test('keeps the order of ids and ignores unknown ids', () => {
  assert.deepEqual(jobsByIds(jobs, ['J003', 'NOPE', 'J001']).map((job) => job.id), ['J003', 'J001']);
});

test('recommends at most three jobs and never one already used', () => {
  const picks = recommendedJobs(jobs, ['J003'], ['J001']);
  assert.ok(picks.length <= 3);
  assert.ok(picks.every((job) => job.id !== 'J003' && job.id !== 'J001'));
});

test('with nothing saved, recommends the jobs closing soonest', () => {
  const closings = recommendedJobs(jobs, [], []).map((job) => job.closing);
  const earliest = jobs.map((job) => job.closing).sort().slice(0, 3);
  assert.deepEqual(closings, earliest);
});

test('formats dates like the website', () => {
  assert.equal(formatDate('2026-11-09'), '9 November 2026');
  assert.equal(formatDate(''), '');
});

test('validates the login fields', () => {
  assert.equal(validateLogin('', '').email, 'Enter your email address.');
  assert.equal(validateLogin('', '').password, 'Enter your password.');
  assert.equal(validateLogin('not-an-email', 'longenough').email, 'That does not look like an email address.');
  assert.equal(validateLogin('a@b.co', 'short').password, 'Your password is at least 8 characters.');
  assert.deepEqual(validateLogin(' a@b.co ', 'longenough'), { email: '', password: '' });
});

test('makes a display name from the email', () => {
  assert.equal(displayNameFrom('shruti.chhetri@student.ozford.edu.au'), 'Shruti Chhetri');
});
