/* ==========================================================================
   api.js - loads the data over HTTPS
   ICT6400 Assessment 4 - CareerHub mobile

   The app reads the same two XML files as the website, from GitHub Pages, so
   a change in the data appears in both. Android also blocks cleartext traffic
   for the whole app (see plugins/withHttpsOnly.js); the check below is a
   second layer that makes a wrong address fail with a clear message.
   ========================================================================== */

import { jobsFromXml, resourcesFromXml } from '../lib/careerhub';

const BASE_URL = 'https://randyabm.github.io/careerhub-ict6400/data';
const TIMEOUT_MS = 15000;

async function fetchText(url) {
  if (!url.startsWith('https://')) {
    throw new Error('Only secure HTTPS connections are allowed.');
  }

  /* Without a time limit a bad connection would leave the spinner on forever. */
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  let text;
  try {
    response = await fetch(url, { signal: controller.signal });
    text = await response.text();
  } catch (error) {
    /* The raw error is technical Java text, so the student gets a plain one. */
    throw new Error(
      error.name === 'AbortError'
        ? 'The connection timed out.'
        : 'The secure connection could not be made.'
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`The server answered with HTTP ${response.status}.`);
  }
  return text;
}

export async function fetchJobs() {
  return jobsFromXml(await fetchText(`${BASE_URL}/jobs.xml`));
}

export async function fetchResources() {
  return resourcesFromXml(await fetchText(`${BASE_URL}/resources.xml`));
}
