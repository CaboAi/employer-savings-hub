/* ===================================================
   Employer Savings Hub — Script
   Form handling, Meta Pixel events, smooth scroll
   =================================================== */

(function () {
  'use strict';

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Header shadow on scroll ---
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 1px 8px rgba(15,23,42,0.08)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }

  // --- Generate UUID for CAPI event deduplication ---
  function generateEventId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // --- SHA-256 hash for CAPI user data ---
  async function sha256(str) {
    if (!str) return '';
    var normalized = str.trim().toLowerCase();
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      var encoded = new TextEncoder().encode(normalized);
      var hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
      var hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    return normalized;
  }

  // --- Phone formatting ---
  var phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var digits = this.value.replace(/\D/g, '');
      if (digits.length >= 10) {
        this.value = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6, 10);
      }
    });
  }

  // --- Form validation & submission ---
  var form = document.getElementById('lead-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Clear previous invalid states
    form.querySelectorAll('.invalid').forEach(function (el) {
      el.classList.remove('invalid');
    });

    var firstName = form.firstName.value.trim();
    var lastName = form.lastName.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    var employeeCount = form.employeeCount.value;
    var industry = form.industry.value;

    // Validate
    var valid = true;
    if (!firstName) { form.firstName.classList.add('invalid'); valid = false; }
    if (!lastName) { form.lastName.classList.add('invalid'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { form.email.classList.add('invalid'); valid = false; }
    if (!phone || phone.replace(/\D/g, '').length < 10) { form.phone.classList.add('invalid'); valid = false; }
    if (!employeeCount) { form.employeeCount.classList.add('invalid'); valid = false; }
    if (!industry) { form.industry.classList.add('invalid'); valid = false; }

    if (!valid) return;

    // Disable button while submitting
    var btn = document.getElementById('submit-btn');
    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    // Build form data
    var eventId = generateEventId();
    var formData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      employeeCount: employeeCount,
      industry: industry,
      eventId: eventId,
      submittedAt: new Date().toISOString(),
      pageUrl: window.location.href
    };

    // Fire Meta Pixel Lead event with event_id for CAPI dedup
    if (typeof fbq === 'function') {
      var pixelData = {
        content_name: 'Employer Savings Hub Lead Form',
        content_category: industry,
        value: 0,
        currency: 'USD'
      };
      fbq('track', 'Lead', pixelData, { eventID: eventId });
    }

    // Prepare hashed user data for CAPI (available on thank-you page or via webhook)
    try {
      var hashedData = {
        em: await sha256(email),
        ph: await sha256(phone.replace(/\D/g, '')),
        fn: await sha256(firstName),
        ln: await sha256(lastName),
        event_id: eventId
      };
      // Store for CAPI server-side pickup
      sessionStorage.setItem('esh_capi_data', JSON.stringify(hashedData));
    } catch (err) {
      // Hashing failure is non-blocking
    }

    // Submit form data
    // Option A: POST to a webhook (Make.com, n8n, Netlify Function, etc.)
    // Option B: Netlify Forms (add netlify attribute to <form>)
    // For now, store in sessionStorage and redirect to thank-you page
    try {
      sessionStorage.setItem('esh_lead', JSON.stringify(formData));

      // If a webhook URL is configured, POST there too
      var webhookUrl = ''; // Replace with your webhook URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      // Redirect to thank-you page
      window.location.href = 'thank-you.html';
    } catch (err) {
      // If webhook fails, still redirect — data is in sessionStorage
      window.location.href = 'thank-you.html';
    }
  });
})();
