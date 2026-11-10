/* ==========================================================================
   theme.js - design tokens
   These are the same values as the :root block in the web app's
   css/styles.css, so a colour on the phone is the same colour as on the site.
   ========================================================================== */

export const colors = {
  navy: '#123a5c',
  navyDark: '#0d2c47',
  blue: '#1c74c8',
  blueLight: '#2f86d8',
  surface: '#ffffff',
  page: '#f4f6f8',
  border: '#dfe5ec',
  text: '#33414f',
  muted: '#6b7a89',
  accent: '#d64550',
  tagBg: '#eaf1f8',
  typeTagBg: '#e6f2ea',
  typeTagText: '#1f6b3f',
  errorBg: '#fdf3f4',
  errorText: '#8f2731',
};

export const radius = 10;

/* React Native accepts the CSS box-shadow syntax, so the web value is reused. */
export const shadow =
  '0 1px 3px rgba(16, 42, 67, 0.08), 0 6px 18px rgba(16, 42, 67, 0.06)';

/* Android's recommended minimum touch target is 48dp. */
export const touchTarget = 48;
