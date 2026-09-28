/* ============================================
   MYERS INSURANCE GROUP — main.js
   ============================================ */

/* ── MOBILE NAV TOGGLE ── */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.innerHTML = isOpen
      ? '<i class="ti ti-x"></i>'
      : '<i class="ti ti-menu-2"></i>';
  });

  /* Close nav when a link is clicked */
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<i class="ti ti-menu-2"></i>';
    });
  });

  /* Close nav when clicking outside */
  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<i class="ti ti-menu-2"></i>';
    }
  });
})();


/* ── BUSINESS TYPE EXPAND/COLLAPSE ── */
function toggleExpanded(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;

  const isHidden = el.hasAttribute('hidden');

  if (isHidden) {
    el.removeAttribute('hidden');
    btn.textContent = '− Hide list';
    btn.setAttribute('aria-expanded', 'true');
  } else {
    el.setAttribute('hidden', '');
    btn.textContent = '+ See all business types';
    btn.setAttribute('aria-expanded', 'false');
  }
}


/* ── SPECTRUM CARDS TOGGLE ── */
function toggleSpectrum(card) {
  const isOpen = card.classList.contains('open');

  /* Close all cards first */
  document.querySelectorAll('.spectrum-card').forEach(function (c) {
    c.classList.remove('open');
  });

  /* If it wasn't open, open it */
  if (!isOpen) {
    card.classList.add('open');
  }
}


/* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ── ACTIVE NAV LINK HIGHLIGHT ── */
(function () {
  const current = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === current || (href !== '/' && current.startsWith(href.replace('.html', '')))) {
      link.style.color = '#B8962E';
    }
  });
})();


/* ── INTERSECTION OBSERVER — FADE IN SECTIONS ── */
(function () {
  if (!('IntersectionObserver' in window)) return;

  const style = document.createElement('style');
  style.textContent = `
    .fade-in {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .fade-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const sections = document.querySelectorAll(
    '.hero, .ai-section, .cover-section, .spectrum-section, ' +
    '.life-section, .why-section, .creators-section, .web-section, .footer-cta'
  );

  sections.forEach(function (section) {
    section.classList.add('fade-in');
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();


/* ── GA4 EVENT TRACKING ── */
(function () {
  /* Track quote CTA clicks */
  document.querySelectorAll('a[href*="contact"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', 'cta_click', {
          event_category: 'engagement',
          event_label: el.textContent.trim().substring(0, 50)
        });
      }
    });
  });

  /* Track coverage review CTA clicks */
  document.querySelectorAll('a[href*="coverage-review"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', 'coverage_review_click', {
          event_category: 'engagement',
          event_label: 'coverage_review_cta'
        });
      }
    });
  });

  /* Track spectrum card opens */
  document.querySelectorAll('.spectrum-card').forEach(function (card) {
    card.addEventListener('click', function () {
      const title = card.querySelector('.spectrum-card-title');
      if (typeof gtag === 'function' && title) {
        gtag('event', 'spectrum_card_open', {
          event_category: 'engagement',
          event_label: title.textContent.trim()
        });
      }
    });
  });

  /* Track business type expand */
  const seeMoreBtn = document.querySelector('.see-more-btn');
  if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', 'business_list_expand', {
          event_category: 'engagement',
          event_label: 'see_all_business_types'
        });
      }
    });
  }
})();
