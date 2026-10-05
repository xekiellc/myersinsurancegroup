/* ============================================
   MYERS INSURANCE GROUP — contact.js
   ============================================ */

(function () {

  const form = document.getElementById('quoteForm');
  const successMsg = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  /* ── FIELD VALIDATION ── */
  function validateField(field) {
    const val = field.value.trim();
    let valid = true;

    removeError(field);

    if (field.hasAttribute('required') && !val) {
      showError(field, 'This field is required.');
      valid = false;
    } else if (field.type === 'email' && val) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) {
        showError(field, 'Please enter a valid email address.');
        valid = false;
      }
    } else if (field.type === 'tel' && val) {
      const telRe = /^[\d\s\-\(\)\+]{7,}$/;
      if (!telRe.test(val)) {
        showError(field, 'Please enter a valid phone number.');
        valid = false;
      }
    }

    return valid;
  }

  function showError(field, msg) {
    field.classList.add('field-error');
    const err = document.createElement('p');
    err.className = 'field-error-msg';
    err.textContent = msg;
    field.parentNode.appendChild(err);
  }

  function removeError(field) {
    field.classList.remove('field-error');
    const existing = field.parentNode.querySelector('.field-error-msg');
    if (existing) existing.remove();
  }

  /* ── VALIDATE ON BLUR ── */
  form.querySelectorAll('.field-input').forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });

    field.addEventListener('input', function () {
      if (field.classList.contains('field-error')) {
        validateField(field);
      }
    });
  });

  /* ── FORM SUBMIT ── */
  form.addEventListener('submit', function (e) {

    /* If no Formspree endpoint yet — prevent submit and show coming soon */
    const action = form.getAttribute('action') || '';
    if (action.includes('REPLACE_WITH')) {
      e.preventDefault();
      showComingSoon();
      return;
    }

    /* Validate all required fields */
    let allValid = true;
    form.querySelectorAll('.field-input').forEach(function (field) {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      e.preventDefault();
      const firstError = form.querySelector('.field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    /* Disable button while submitting */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    /* Let Formspree handle the actual submission */
    /* On success Formspree redirects or we intercept with fetch below */
    e.preventDefault();

    const formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        showSuccess();
        trackFormSubmit();
      } else {
        return res.json().then(function (data) {
          throw new Error(data.error || 'Submission failed.');
        });
      }
    })
    .catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send my quote request →';
      showFormError('Something went wrong. Please try again or email us at hello@myersinsurancegroup.com.');
      console.error('Form error:', err);
    });

  });

  /* ── SUCCESS STATE ── */
  function showSuccess() {
    form.style.display = 'none';
    if (successMsg) {
      successMsg.removeAttribute('hidden');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ── COMING SOON STATE (no Formspree yet) ── */
  function showComingSoon() {
    const existing = document.querySelector('.coming-soon-msg');
    if (existing) return;

    const msg = document.createElement('div');
    msg.className = 'coming-soon-msg';
    msg.innerHTML = `
      <i class="ti ti-clock"></i>
      <p>Email us at <a href="mailto:hello@myersinsurancegroup.com">hello@myersinsurancegroup.com</a>.</p>
    `;
    form.insertAdjacentElement('beforebegin', msg);
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── FORM ERROR ── */
  function showFormError(msg) {
    const existing = document.querySelector('.form-submit-error');
    if (existing) existing.remove();

    const err = document.createElement('p');
    err.className = 'form-submit-error';
    err.textContent = msg;
    submitBtn.insertAdjacentElement('afterend', err);
  }

  /* ── GA4 TRACKING ── */
  function trackFormSubmit() {
    if (typeof gtag === 'function') {
      gtag('event', 'quote_form_submit', {
        event_category: 'conversion',
        event_label: 'contact_page_form'
      });
    }
  }

  /* ── DYNAMIC FIELD: show/hide biz type based on coverage selection ── */
  const coverageSelect = document.getElementById('coverage');
  const bizTypeGroup = document.getElementById('bizTypeGroup');

  if (coverageSelect && bizTypeGroup) {
    const businessValues = ['Business Insurance', 'Content Creator'];

    function toggleBizType() {
      const val = coverageSelect.value;
      const isBiz = businessValues.some(function (v) {
        return val.includes(v) || val === 'Multiple / Not Sure';
      });
      bizTypeGroup.style.display = isBiz ? 'block' : 'none';
    }

    /* Hide by default — show only when relevant */
    bizTypeGroup.style.display = 'none';
    coverageSelect.addEventListener('change', toggleBizType);
  }

})();
