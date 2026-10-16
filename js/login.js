/* ==========================================================================
   login.js - the Login page
   ICT6400 Assessment 2 - Ozford Student Career Hub

   Client-side validation only. There is no server in this prototype, so the
   form checks the shape of what was typed and then passes the student to the
   dashboard. It is not authentication, and the report states that plainly in
   the security section rather than implying otherwise.
   ========================================================================== */

(function () {
  'use strict';

  /* One @, something before it, a dot and at least two letters after it. */
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  var MIN_PASSWORD = 8;

  var form, emailEl, passwordEl;

  function setError(fieldWrap, message) {
    fieldWrap.classList.toggle('has-error', Boolean(message));
    fieldWrap.querySelector('.error').textContent = message || '';
    var input = fieldWrap.querySelector('input');
    if (input) { input.setAttribute('aria-invalid', message ? 'true' : 'false'); }
  }

  function wrapOf(input) {
    return input.closest('.field');
  }

  function validate() {
    var problems = [];

    var email = emailEl.value.trim();
    if (email === '') {
      setError(wrapOf(emailEl), 'Enter your email address.');
      problems.push(emailEl);
    } else if (!EMAIL_PATTERN.test(email)) {
      setError(wrapOf(emailEl), 'That does not look like an email address.');
      problems.push(emailEl);
    } else {
      setError(wrapOf(emailEl), '');
    }

    var password = passwordEl.value;
    if (password === '') {
      setError(wrapOf(passwordEl), 'Enter your password.');
      problems.push(passwordEl);
    } else if (password.length < MIN_PASSWORD) {
      setError(wrapOf(passwordEl), 'Your password is at least ' + MIN_PASSWORD + ' characters.');
      problems.push(passwordEl);
    } else {
      setError(wrapOf(passwordEl), '');
    }

    return problems;
  }

  /* "shruti.chhetri@student.ozford.edu.au" becomes "Shruti Chhetri", so the
     dashboard has something warmer than the raw address to greet with. */
  function displayNameFrom(email) {
    var local = email.split('@')[0];
    return local.split(/[._-]+/).filter(Boolean).map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join(' ') || 'Student';
  }

  function start() {
    form = document.getElementById('login-form');
    if (!form) { return; }
    emailEl = document.getElementById('email');
    passwordEl = document.getElementById('password');

    /* Errors clear as soon as the student starts correcting the field, rather
       than waiting for the next submit. */
    [emailEl, passwordEl].forEach(function (input) {
      input.addEventListener('input', function () {
        if (wrapOf(input).classList.contains('has-error')) { setError(wrapOf(input), ''); }
      });
    });

    /* Account creation is out of scope for this prototype, so the link says
       so instead of leading to a page that does not exist. */
    var createAccount = document.getElementById('create-account');
    if (createAccount) {
      createAccount.addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('account-error').textContent =
          'Account creation is not part of this prototype. Sign in with any student email to reach the dashboard.';
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var problems = validate();

      if (problems.length) {
        problems[0].focus();
        return;
      }

      CareerHub.setSession({
        email: emailEl.value.trim(),
        name: displayNameFrom(emailEl.value.trim())
      });
      window.location.href = 'dashboard.html';
    });
  }

  /* app.js wires the navigation and the dialog itself, so this only has to
     start the page. */
  document.addEventListener('DOMContentLoaded', start);
}());
