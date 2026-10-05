/* ============================================
   MYERS INSURANCE GROUP — MAIN.JS
   Navigation, animations, interactions
   ============================================ */

/* ── NAV TOGGLE (MOBILE) ── */
(function() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var icon = document.getElementById('navIcon');

  if (!toggle || !links) return;

  toggle.addEventListener('click', function() {
    var isOpen = links.classList.contains('open');
    links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', !isOpen);
    if (icon) {
      icon.className = isOpen ? 'ti ti-menu-2' : 'ti ti-x';
    }
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  /* Close on nav link click */
  links.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (icon) icon.className = 'ti ti-menu-2';
      document.body.style.overflow = '';
    });
  });

  /* Close on outside click */
  document.addEventListener('click', function(e) {
    if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (icon) icon.className = 'ti ti-menu-2';
      document.body.style.overflow = '';
    }
  });
})();

/* ── SCROLL FADE-IN ANIMATIONS ── */
(function() {
  var fadeEls = document.querySelectorAll('.fade-up');
  if (!fadeEls.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(function(el) { observer.observe(el); });
})();

/* ── NAV SCROLL BEHAVIOR ── */
(function() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var lastScroll = 0;
  var ticking = false;

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        var currentScroll = window.pageYOffset;

        /* Add scrolled class for stronger background */
        if (currentScroll > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ── SPECTRUM CARDS ── */
(function() {
  var cards = document.querySelectorAll('.spec-card');
  if (!cards.length) {
    /* Fallback for old class name */
    cards = document.querySelectorAll('.spectrum-card');
  }
  if (!cards.length) return;

  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      cards.forEach(function(c) { c.classList.remove('active'); });
      this.classList.add('active');
    });
  });
})();

/* ── GA4 EVENT TRACKING ── */
(function() {
  function track(category, label) {
    if (typeof gtag !== 'function') return;
    gtag('event', 'click', {
      event_category: category,
      event_label: label
    });
  }

  /* CTA buttons */
  document.querySelectorAll('.btn-primary, .btn-outline, .btn-outline-dark, .btn-outline-white, .nav-cta').forEach(function(btn) {
    btn.addEventListener('click', function() {
      track('CTA', this.textContent.trim().substring(0, 50));
    });
  });

  /* Product tiles */
  document.querySelectorAll('.product-tile').forEach(function(tile) {
    tile.addEventListener('click', function() {
      var title = this.querySelector('.product-tile-title');
      track('Product', title ? title.textContent.trim() : 'unknown');
    });
  });

  /* Outbound links */
  document.querySelectorAll('a[href^="http"]').forEach(function(a) {
    if (!a.href.includes('myersinsurancegroup.com')) {
      a.addEventListener('click', function() {
        track('Outbound', this.href);
      });
    }
  });
})();

/* ── CHECKBOX HIGHLIGHT TOGGLE (CONTACT FORM) ── */
(function() {
  document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      this.closest('.checkbox-item').classList.toggle('checked', this.checked);
    });
  });
})();

/* ── REFERRAL NAME FIELD (CONTACT FORM) ── */
(function() {
  var sourceSelect = document.getElementById('source');
  var referralGroup = document.getElementById('referralNameGroup');
  if (!sourceSelect || !referralGroup) return;

  var referralTriggers = ['Referral', 'Friend / Family', 'Realtor / Mortgage Pro'];

  sourceSelect.addEventListener('change', function() {
    if (referralTriggers.indexOf(this.value) !== -1) {
      referralGroup.classList.add('visible');
    } else {
      referralGroup.classList.remove('visible');
      var nameField = document.getElementById('referral_name');
      if (nameField) nameField.value = '';
    }
  });
})();

/* ── CONTACT FORM SUBMIT (FORMSPREE) ── */
(function() {
  var form = document.getElementById('quoteForm');
  var successEl = document.getElementById('formSuccess');
  var submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    /* Basic validation */
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var hasError = false;

    [name, email].forEach(function(field) {
      if (!field) return;
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        hasError = true;
      } else {
        field.style.borderColor = '';
      }
    });

    if (hasError) return;

    /* Check at least one coverage checkbox */
    var checkboxes = form.querySelectorAll('input[name="coverage"]:checked');
    if (checkboxes.length === 0) {
      var grid = document.getElementById('coverageGrid');
      if (grid) {
        grid.style.outline = '2px solid #e74c3c';
        grid.style.borderRadius = '8px';
        setTimeout(function() {
          grid.style.outline = '';
        }, 3000);
      }
    }

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(function(response) {
      if (response.ok) {
        form.style.display = 'none';
        if (successEl) successEl.removeAttribute('hidden');
        if (typeof gtag === 'function') {
          gtag('event', 'form_submit', { event_category: 'lead', event_label: 'quote_form' });
        }
      } else {
        submitBtn.textContent = 'Send my quote request →';
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or email us at hello@myersinsurancegroup.com.');
      }
    })
    .catch(function() {
      submitBtn.textContent = 'Send my quote request →';
      submitBtn.disabled = false;
      alert('Something went wrong. Please try again or email us at hello@myersinsurancegroup.com.');
    });
  });
})();

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ── NAV SCROLLED STYLE ── */
(function() {
  var style = document.createElement('style');
  style.textContent = '.site-header.scrolled { background: rgba(255,255,255,0.95); box-shadow: 0 1px 0 rgba(0,0,0,0.08); }';
  document.head.appendChild(style);
})();
