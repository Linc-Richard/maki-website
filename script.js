/* ==========================================================================
   MAKI SECONDARY SCHOOL — Main script
   Lightweight vanilla JS. No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     1. Scroll progress bar + back-to-top + header shadow
     ---------------------------------------------------------------------- */
  var progressBar = document.querySelector('.scroll-progress');
  var backToTop = document.querySelector('.back-to-top');
  var header = document.querySelector('.site-header');

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.pageYOffset / max) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + '%';
    if (backToTop) backToTop.classList.toggle('show', window.pageYOffset > 500);
    if (header) header.classList.toggle('scrolled', window.pageYOffset > 8);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------------------
     2. Announcement bar dismiss
     ---------------------------------------------------------------------- */
  var announce = document.querySelector('.announcement-bar');
  if (announce) {
    var closeBtn = announce.querySelector('.announcement-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        announce.classList.add('hidden');
        try { localStorage.setItem('maki-announce-dismissed', '1'); } catch (e) { /* ignore */ }
      });
    }
    try {
      if (localStorage.getItem('maki-announce-dismissed') === '1') announce.classList.add('hidden');
    } catch (e) { /* ignore */ }
  }

  /* ----------------------------------------------------------------------
     3. Theme toggle (dark / light) — persisted
     ---------------------------------------------------------------------- */
  var root = document.documentElement;
  var themeBtn = document.querySelector('.theme-toggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      var key = theme === 'dark' ? 'aria.light' : 'aria.dark';
      var fallbackLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      var label = ((translations && translations[currentLang] && translations[currentLang][key]) ||
        (translations && translations['en'] && translations['en'][key])) || fallbackLabel;
      themeBtn.setAttribute('aria-label', label);
    }
  }

  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('maki-theme'); } catch (e) { /* ignore */ }
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);
  })();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('maki-theme', next); } catch (e) { /* ignore */ }
    });
  }

  /* ----------------------------------------------------------------------
     4. Mobile navigation
     ---------------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  function closeMobileNav() {
    if (!siteNav) return;
    siteNav.classList.remove('open');
    if (navToggle) navToggle.classList.remove('open');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Close menu when a nav link is chosen
  document.querySelectorAll('.site-nav a.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  // Dropdown toggles (mobile / keyboard)
  document.querySelectorAll('.has-dropdown .dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var li = btn.closest('.has-dropdown');
      var open = li.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Close mobile nav on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMobileNav();
  });

  /* ----------------------------------------------------------------------
     5. Active nav link
     ---------------------------------------------------------------------- */
  (function highlightNav() {
    var current = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.site-nav a.nav-link').forEach(function (link) {
      var href = (link.getAttribute('href') || '').split('#')[0];
      if (href === current) {
        link.classList.add('active');
        var li = link.closest('.has-dropdown');
        if (li) li.classList.add('active');
      }
    });
  })();

  /* ----------------------------------------------------------------------
     6. Reveal on scroll
     ---------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ----------------------------------------------------------------------
     7. Animated counters
     ---------------------------------------------------------------------- */
  var counters = document.querySelectorAll('.stat-num[data-count]');

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = prefersReduced ? 0 : 1200;
    var startTime = null;

    function frame(now) {
      if (!startTime) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = parseFloat(el.getAttribute('data-count')).toLocaleString() +
        (el.getAttribute('data-suffix') || '');
    });
  }

  /* ----------------------------------------------------------------------
     8. Countdown
     ---------------------------------------------------------------------- */
  var countdownEl = document.querySelector('[data-countdown]');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function renderCountdown(target) {
    var diff = target - Date.now();
    if (diff <= 0) {
      var wrap = countdownEl.closest('.countdown-band');
      if (wrap) {
        var info = wrap.querySelector('.countdown-info');
        if (info) {
          var dict = window.MAKI.translations && (window.MAKI.translations[window.MAKI.lang] || window.MAKI.translations['en']);
          var doneTitle = (dict && dict['countdown.done']) || 'The big day has arrived!';
          var doneText = (dict && dict['countdown.done_text']) || 'We will announce the next date soon.';
          info.innerHTML = '<h3>' + doneTitle + '</h3><p>' + doneText + '</p>';
        }
      }
      return;
    }
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    var dayEl = countdownEl.querySelector('[data-unit="days"]');
    var hourEl = countdownEl.querySelector('[data-unit="hours"]');
    var minEl = countdownEl.querySelector('[data-unit="minutes"]');
    var secEl = countdownEl.querySelector('[data-unit="seconds"]');
    if (dayEl) dayEl.textContent = days;
    if (hourEl) hourEl.textContent = pad(hours);
    if (minEl) minEl.textContent = pad(mins);
    if (secEl) secEl.textContent = pad(secs);
  }

  if (countdownEl) {
    var targetDate = new Date(countdownEl.getAttribute('data-countdown')).getTime();
    if (!isNaN(targetDate)) {
      setInterval(function () { renderCountdown(targetDate); }, 1000);
    }
  }

  /* ----------------------------------------------------------------------
     9. Accordion
     ---------------------------------------------------------------------- */
  document.querySelectorAll('.acc-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = head.closest('.acc-item');
      var body = item.querySelector('.acc-body');
      var isOpen = item.classList.contains('open');

      // Optional: close siblings
      var siblings = item.parentElement.children;
      Array.prototype.forEach.call(siblings, function (sib) {
        if (sib !== item) {
          sib.classList.remove('open');
          var sBody = sib.querySelector('.acc-body');
          if (sBody) sBody.style.maxHeight = '0px';
          var sHead = sib.querySelector('.acc-head');
          if (sHead) sHead.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      head.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      if (body) {
        body.style.maxHeight = isOpen ? '0px' : body.scrollHeight + 'px';
      }
    });
    head.setAttribute('aria-expanded', 'false');
    head.setAttribute('role', 'button');
  });

  /* ----------------------------------------------------------------------
     10. Button ripple
     ---------------------------------------------------------------------- */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('pointerdown', function (e) {
      if (prefersReduced) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    });
  });

  /* ----------------------------------------------------------------------
     11. Footer year
     ---------------------------------------------------------------------- */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ----------------------------------------------------------------------
     12. Gallery — slideshow
     ---------------------------------------------------------------------- */
  var slideshow = document.querySelector('.slideshow');

  if (slideshow) {
    var slideData = [
      { src: 'assets/img/top-view-1.jpg', alt: 'Aerial view of Maki Secondary School campus', captionKey: 'gallery.slide1' },
      { src: 'assets/img/top-view-2.jpg', alt: 'Aerial view of the school grounds', captionKey: 'gallery.slide2' },
      { src: 'assets/img/compound.jpg', alt: 'School compound from above', captionKey: 'gallery.slide3' },
      { src: 'assets/img/art-activity.jpg', alt: 'Students presenting art ideas', captionKey: 'gallery.slide4' },
      { src: 'assets/img/leaders.jpg', alt: 'School leaders with students', captionKey: 'gallery.slide5' },
      { src: 'assets/img/computer-club.jpg', alt: 'Students using computers in the club', captionKey: 'gallery.slide6' },
      { src: 'assets/img/green-maki.jpg', alt: 'Student planting a tree for Green Maki', captionKey: 'gallery.slide7' },
      { src: 'assets/img/scout-activities.jpg', alt: 'Students taking part in scout activities', captionKey: 'gallery.slide8' }
    ];

    var track = slideshow.querySelector('.slideshow-track');
    var dotsWrap = slideshow.querySelector('.slide-dots');
    var prevBtn = slideshow.querySelector('.slide-arrow.prev');
    var nextBtn = slideshow.querySelector('.slide-arrow.next');
    var current = 0;
    var timer = null;

    function renderSlides() {
      if (!track) return;
      track.innerHTML = slideData.map(function (slide, i) {
        return '<div class="slide' + (i === 0 ? ' active' : '') + '" role="group" aria-roledescription="slide" aria-label="Slide ' + (i + 1) + ' of ' + slideData.length + '">' +
          '<img src="' + slide.src + '" alt="' + slide.alt + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async">' +
          '<div class="slide-caption"><h3 data-i18n="' + slide.captionKey + '"></h3></div>' +
          '</div>';
      }).join('');
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = slideData.map(function (_, i) {
        return '<button class="slide-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Go to slide ' + (i + 1) + '"></button>';
      }).join('');

      dotsWrap.querySelectorAll('.slide-dot').forEach(function (dot) {
        dot.addEventListener('click', function () {
          goTo(parseInt(dot.getAttribute('data-index'), 10));
          restart();
        });
      });
    }

    function goTo(index) {
      current = (index + slideData.length) % slideData.length;
      var slides = track.querySelectorAll('.slide');
      slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
      var dots = dotsWrap.querySelectorAll('.slide-dot');
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 4500);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });

    // Touch swipe
    var touchX = null;
    slideshow.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
    slideshow.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var diff = touchX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) next(); else prev();
        restart();
      }
      touchX = null;
    }, { passive: true });

    if (prefersReduced) {
      renderSlides(); renderDots(); goTo(0);
    } else {
      renderSlides(); renderDots(); goTo(0); restart();
    }
  }

  function updateSlideshowAria() {
    if (!track || !slideData) return;
    var lang = (window.MAKI && window.MAKI.lang) || 'en';
    var dict = (translations && (translations[lang] || translations['en'])) || {};
    var slideOf = dict['aria.slideOf'] || 'Slide {n} of {m}';
    var goto = dict['aria.gotoSlide'] || 'Go to slide {n}';
    track.setAttribute('aria-label', dict['aria.slideshow'] || 'School photos slideshow');
    track.querySelectorAll('.slide').forEach(function (s, i) {
      s.setAttribute('aria-label', slideOf.replace('{n}', i + 1).replace('{m}', slideData.length));
    });
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.slide-dot').forEach(function (d, i) {
        d.setAttribute('aria-label', goto.replace('{n}', i + 1));
      });
    }
  }

  /* ----------------------------------------------------------------------
     13. Gallery — filters + grid + lightbox
     ---------------------------------------------------------------------- */
  var galleryGrid = document.querySelector('.gallery-grid');
  var lightbox = document.querySelector('.lightbox');

  function renderGalleryCaptions() {
    if (!galleryGrid) return;
    galleryGrid.querySelectorAll('.g-item').forEach(function (item) {
      var cap = item.querySelector('.g-cap');
      var key = item.getAttribute('data-cap');
      if (cap && key) {
        var translations = window.MAKI.translations;
        var text = (translations && translations[window.MAKI.lang] && translations[window.MAKI.lang][key]) ||
          (translations && translations['en'] && translations['en'][key]) || key;
        cap.textContent = text;
      }
    });
  }

  if (galleryGrid && lightbox) {
    var items = Array.prototype.slice.call(galleryGrid.querySelectorAll('.g-item'));

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        items.forEach(function (item) {
          var cats = (item.getAttribute('data-cats') || '').split(' ');
          var show = filter === 'all' || cats.indexOf(filter) !== -1;
          item.classList.toggle('is-hidden', !show);
        });
      });
    });

    // Lightbox
    var visibleItems = function () { return items.filter(function (i) { return !i.classList.contains('is-hidden'); }); };
    var lbImg = lightbox && lightbox.querySelector('.lightbox-img');
    var lbCap = lightbox && lightbox.querySelector('.lightbox-caption');
    var lbIndex = 0;

    function openLightbox(item) {
      if (!lightbox) return;
      var list = visibleItems();
      lbIndex = list.indexOf(item);
      showLightbox();
      document.body.style.overflow = 'hidden';
    }

    function showLightbox() {
      var list = visibleItems();
      if (!list.length) return;
      var item = list[lbIndex];
      var img = item.querySelector('img');
      var cap = item.querySelector('.g-cap');
      if (lbImg) { lbImg.src = img.getAttribute('data-full') || img.src; lbImg.alt = img.alt; }
      if (lbCap) { lbCap.textContent = cap ? cap.textContent : ''; }
      lightbox.classList.add('open');
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    items.forEach(function (item) {
      item.setAttribute('tabindex', '0');
      item.addEventListener('click', function () { openLightbox(item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
      });
    });

    var lbClose = lightbox && lightbox.querySelector('.lightbox-close');
    var lbPrev = lightbox && lightbox.querySelector('.lightbox-prev');
    var lbNext = lightbox && lightbox.querySelector('.lightbox-next');

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); lbIndex = (lbIndex - 1 + visibleItems().length) % visibleItems().length; showLightbox(); });
    if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); lbIndex = (lbIndex + 1) % visibleItems().length; showLightbox(); });

    if (lightbox) {
      lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
      document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + visibleItems().length) % visibleItems().length; showLightbox(); }
        if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % visibleItems().length; showLightbox(); }
      });
    }
  }

  /* ----------------------------------------------------------------------
     14. Resources & downloads
     ---------------------------------------------------------------------- */
  var resourcesList = document.getElementById('resources-list');

  function initResources() {
    if (!resourcesList) return;
    var resources = window.MAKI.resources || [];

    resourcesList.innerHTML = resources.map(function (r, i) {
      return '<div class="resource-item">' +
        '<i class="fas fa-file-pdf doc" aria-hidden="true"></i>' +
        '<div><h3 data-i18n="' + (r.titleKey || 'resources.r1.title') + '">' + r.title + '</h3><span class="meta">' + r.size + '</span></div>' +
        '<a class="btn btn-ghost" href="' + r.file + '" download target="_blank" rel="noopener">' +
        '<i class="fas fa-download" aria-hidden="true"></i> <span data-i18n="events.download">Download</span></a>' +
        '</div>';
    }).join('');

    if (window.MAKI.translate) window.MAKI.translate(window.MAKI.lang);
  }

  /* ----------------------------------------------------------------------
     15. Contact form
     ---------------------------------------------------------------------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var errors = {
      name: contactForm.querySelector('#err-name'),
      email: contactForm.querySelector('#err-email'),
      message: contactForm.querySelector('#err-message')
    };

    function setError(field, msg) {
      if (errors[field]) errors[field].textContent = msg;
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contactForm.querySelector('#name').value.trim();
      var email = contactForm.querySelector('#email').value.trim();
      var message = contactForm.querySelector('#message').value.trim();
      var valid = true;

      if (!name) { setError('name', window.MAKI.translations[window.MAKI.lang]['contact.err.name']); valid = false; }
      else setError('name', '');

      if (!email) { setError('email', window.MAKI.translations[window.MAKI.lang]['contact.err.email']); valid = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', window.MAKI.translations[window.MAKI.lang]['contact.err.emailInvalid']); valid = false; }
      else setError('email', '');

      if (!message) { setError('message', window.MAKI.translations[window.MAKI.lang]['contact.err.message']); valid = false; }
      else setError('message', '');

      var alert = contactForm.querySelector('.form-alert');
      if (!valid) {
        if (alert) { alert.className = 'form-alert error'; alert.textContent = window.MAKI.translations[window.MAKI.lang]['contact.err.summary']; }
        return;
      }

      if (alert) { alert.className = 'form-alert'; alert.textContent = ''; }
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, message: message, lang: window.MAKI.lang })
      })
        .then(function (resp) {
          if (!resp.ok) throw new Error('request failed');
          return resp.json();
        })
        .then(function () {
          if (alert) { alert.className = 'form-alert success'; alert.textContent = window.MAKI.translations[window.MAKI.lang]['contact.success']; }
          contactForm.reset();
        })
        .catch(function () {
          if (alert) { alert.className = 'form-alert error'; alert.textContent = window.MAKI.translations[window.MAKI.lang]['contact.err.server']; }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
          setTimeout(function () {
            if (alert) { alert.className = 'form-alert'; }
          }, 6000);
        });
    });
  }

  /* ----------------------------------------------------------------------
     16. Translations (EN / SW)
     ---------------------------------------------------------------------- */
  var translations = {
    en: {
      'brand.name': 'MAKI Secondary School',
      'brand.sub': 'Secondary School',
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.history': 'Our History',
      'nav.events': 'Events',
      'nav.gallery': 'Gallery',
      'nav.contact': 'Contact',
      'nav.academics': 'Academics',
      'nav.admissions': 'Admissions',
      'nav.news': 'News',

      'announce.text': 'Form Six Graduation Ceremony — April 2026',
      'countdown.days': 'Days',
      'countdown.hours': 'Hours',
      'countdown.mins': 'Mins',
      'countdown.secs': 'Secs',
      'month.jan': 'Jan',
      'month.feb': 'Feb',
      'month.mar': 'Mar',
      'month.apr': 'Apr',
      'month.may': 'May',
      'month.jun': 'Jun',
      'month.jul': 'Jul',
      'month.aug': 'Aug',
      'month.sep': 'Sep',
      'month.oct': 'Oct',
      'month.nov': 'Nov',
      'month.dec': 'Dec',
      'resources.r1.title': 'Form Six NECTA Examination Timetable — 2026',
      'events.download': 'Download',
      'aria.skip': 'Skip to main content',
      'aria.openMenu': 'Open menu',
      'aria.toggleAbout': 'Toggle About submenu',
      'aria.toggleAcademics': 'Toggle Academics submenu',
      'aria.closeAnnouncement': 'Close announcement',
      'aria.backToTop': 'Back to top',
      'aria.light': 'Switch to light mode',
      'aria.dark': 'Switch to dark mode',
      'aria.prevSlide': 'Previous slide',
      'aria.nextSlide': 'Next slide',
      'aria.gotoSlide': 'Go to slide {n}',
      'aria.slideOf': 'Slide {n} of {m}',
      'aria.closeLightbox': 'Close image viewer',
      'aria.prevImage': 'Previous image',
      'aria.nextImage': 'Next image',
      'aria.slideshow': 'School photos slideshow',
      'aria.lightbox': 'Image viewer',
      'aria.social.facebook': 'Facebook',
      'aria.social.instagram': 'Instagram',
      'aria.social.whatsapp': 'WhatsApp',
      'aria.language': 'Language',
      'aria.primary': 'Primary',
      'aria.breadcrumb': 'Breadcrumb',
      'aria.footerLinks': 'Footer quick links',
      'aria.footerResources': 'Footer resources',
      'aria.galleryOpen1': 'Open gallery — Top View',
      'aria.galleryOpen2': 'Open gallery — Computer Club',
      'aria.galleryOpen3': 'Open gallery — Scout Activities',

      'hero.eyebrow': 'Knowledge · Discipline · Creativity',
      'hero.title': 'Welcome to MAKI Secondary School',
      'hero.subtitle': 'Empowering students with knowledge, discipline and creativity since 2007.',
      'hero.cta1': 'Explore Our History',
      'hero.cta2': 'Contact Us',
      'hero.meta1': 'Est. 2007',
      'hero.meta2': 'Form 1 – 6',
      'hero.meta3': 'Rombo, Kilimanjaro',

      'welcome.title': 'Welcome to MAKI',
      'welcome.sub': 'A school dedicated to academic excellence, leadership and service to the community.',
      'f1.title': 'Academic Excellence',
      'f1.text': 'Strong results through dedicated teaching and personal support for every student.',
      'f2.title': 'Discipline & Integrity',
      'f2.text': 'We raise well-disciplined students of integrity who are ready to serve their community.',
      'f3.title': 'Modern Learning',
      'f3.text': 'Laboratories, ICT and modern teaching methods that prepare students for the future.',
      'f4.title': 'Student Leadership',
      'f4.text': 'Student government, Scouts and clubs grow the leaders of tomorrow.',
      'f5.title': 'Community Spirit',
      'f5.text': 'Rooted in the villages of Marangu and Kitowo, we serve with unity and vision.',
      'f6.title': 'Sports & Talent',
      'f6.text': 'We nurture talent in football, basketball, arts and more.',

      'stats.title': 'MAKI by Numbers',
      'stats.sub': 'Facts that show our growth and our impact.',
      'stats.students': 'Students',
      'stats.teachers': 'Teachers',
      'stats.graduates': 'Graduates',
      'stats.clubs': 'Clubs & Sports',

      'features.title': 'Why Choose MAKI?',
      'features.sub': 'A blend of tradition and innovation that helps every learner thrive.',

      'events.title': 'Upcoming Events',
      'events.sub': 'Key dates in our school calendar.',
      'events.page_title': 'Events &amp; Resources',
      'events.page_sub': 'Past highlights and downloadable resources.',
      'events.countdown_label': 'Form Six Graduation Ceremony',
      'ev1.date': 'April 17, 2026',
      'ev1.title': 'Form Six Graduation Ceremony',
      'ev1.desc': 'Celebrating the achievements of our Form Six cohort.',
      'ev2.date': 'May 4, 2026',
      'ev2.title': 'Form Six National Exam',
      'ev2.desc': 'NECTA examinations for Form Six students.',
      'ev3.date': 'July 8, 2026',
      'ev3.title': 'Arrival of New Form Five',
      'ev3.desc': 'Welcoming the new Form Five students to campus.',
      'tag.upcoming': 'Upcoming',
      'tag.important': 'Important',
      'tag.closed': 'Completed',
      'countdown.until': 'Until the big day',
      'countdown.done': 'The big day has arrived!',
      'countdown.done_text': 'We will announce the next date soon.',
      'events.past_title': 'Past Highlights',
      'pe1.date': 'November 2025',
      'pe1.text': 'Graduation Ceremony for the Class of 2025',
      'pe2.date': 'October 2025',
      'pe2.text': 'Debate Competition — MAKI ranked 1st',
      'pe3.date': 'September 2025',
      'pe3.text': 'Teachers\' Appreciation Week',
      'resources.title': 'Resources & Downloads',
      'resources.sub': 'Important documents for students, parents and teachers.',

      'galleryPreview.title': 'Our Gallery',
      'galleryPreview.text': 'Moments from classrooms, sports fields and cultural life at MAKI.',
      'galleryPreview.cta': 'View Full Gallery',

      'testimonials.title': 'What Students & Parents Say',
      'testimonials.sub': 'Kind words from the MAKI family.',
      't1.quote': 'MAKI gave me confidence, discipline and a love for science. I will always be grateful to my teachers.',
      't1.author': 'Amina J.',
      't1.role': 'Form Six Student',
      't2.quote': 'The teachers truly care about every student. My child has grown in both academics and character.',
      't2.author': 'Joseph M.',
      't2.role': 'Parent',
      't3.quote': 'From the Science Club to the Scouts, there is always something to learn and enjoy at MAKI.',
      't3.author': 'Baraka S.',
      't3.role': 'Form Four Student',

      'faq.title': 'Frequently Asked Questions',
      'faq.sub': 'Quick answers to common questions.',
      'q1.q': 'Where is MAKI Secondary School located?',
      'q1.a': 'We are located at Mashati Kasurua, Rombo District, Kilimanjaro Region, Tanzania.',
      'q2.q': 'Which levels does the school offer?',
      'q2.a': 'We offer secondary education from Form One through Form Six (Advanced Level).',
      'q3.q': 'What subjects are offered?',
      'q3.a': 'We offer sciences, mathematics, languages and humanities following the NECTA curriculum.',
      'q4.q': 'How do I apply for admission?',
      'q4.a': 'Contact our office for a guide, complete the application form, and visit the campus. See the Admissions page for details.',
      'q5.q': 'Are there sports and clubs?',
      'q5.a': 'Yes. Football, basketball, Scouts, the Computer Club, and the Green MAKI project are all part of school life.',
      'q6.q': 'Does the school provide meals and water?',
      'q6.a': 'Please contact our office for details on boarding and facilities.',

      'cta.title': 'Ready to join the MAKI family?',
      'cta.text': 'Visit our campus or get in touch today to learn more about admissions.',
      'cta.btn1': 'Contact Us',
      'cta.btn2': 'Read More',

      'about.title': 'About MAKI Secondary School',
      'about.sub': 'Who we are and what we stand for.',
      'mission.title': 'Our Mission',
      'mission.text': 'To nurture students with strong academic foundations, discipline and creativity, preparing them to contribute meaningfully to society.',
      'vision.title': 'Our Vision',
      'vision.text': 'To be a leading institution recognised for excellence in academics, innovation and community service.',
      'values.title': 'Our Values',
      'values.text': 'The principles that guide us every day.',
      'v1': 'Integrity and discipline',
      'v2': 'Commitment to excellence',
      'v3': 'Respect for diversity',
      'v4': 'Service to the community',
      'v5': 'Teamwork',
      'v6': 'Responsibility',

      'history.title': 'Our History',
      'history.sub': 'From two villages to academic excellence.',
      'history.ch1.year': '2007',
      'history.ch1.title': 'The Founding of MAKI',
      'history.ch1.text': 'MAKI Secondary School was born in the heart of Kilimanjaro. Its name blends two villages — Marangu and Kitowo — symbolising unity and hope. It began with 5 dedicated teachers, 102 eager students and two classroom blocks.',
      'history.ch2.year': '2007–2020',
      'history.ch2.title': 'Rising from Challenges',
      'history.ch2.text': 'The early years brought water shortages, limited staff and few materials. Yet the school stood firm, learning that resilience and belief could transform lives.',
      'history.ch3.year': '2010',
      'history.ch3.title': 'First Science Laboratory',
      'history.ch3.text': 'The school built its first science laboratory, opening a new era of hands-on learning in Chemistry and Biology.',
      'history.ch4.year': '2020',
      'history.ch4.title': 'New Teachers, New Energy',
      'history.ch4.text': 'Field teachers brought fresh expertise. Sir Vitus Mwanankulu\'s dedication to Chemistry was recognised with a certificate of excellence by the Minister of Education, Adolf Mkenda.',
      'history.ch5.year': '2024',
      'history.ch5.title': 'Advanced Level (Form Five)',
      'history.ch5.text': 'Through the advocacy of Dr. Steve Moshi, MAKI introduced Advanced Level studies. The first Form Five class welcomed 66 students — 33 boys and 33 girls.',
      'history.ch6.year': 'Today',
      'history.ch6.title': 'Vision for the Future',
      'history.ch6.text': 'MAKI continues to grow in academics, sports and leadership — expanding grounds, improving water access and strengthening Scouts and student government.',
      'motto.title': 'Our Moto',
      'motto.sub': 'The principles we stand for.',
      'motto1.title': 'Knowledge',
      'motto1.text': 'Learning for the good of the community',
      'motto2.title': 'Discipline',
      'motto2.text': 'Foundations for a better life',
      'motto3.title': 'Service',
      'motto3.text': 'Dedication to our community',

      'gallery.title': 'School Gallery',
      'gallery.sub': 'Moments from our classrooms, sports fields and cultural events.',
      'gallery.slideshow': 'Featured Photos',
      'filter.all': 'All',
      'filter.campus': 'Campus',
      'filter.events': 'Events',
      'filter.students': 'Students',
      'filter.clubs': 'Clubs',
      'gallery.slide1': 'Top View — Main Building',
      'gallery.slide2': 'Top View — Sports Field',
      'gallery.slide3': 'School Compound Overview',
      'gallery.slide4': 'Art Activity Day',
      'gallery.slide5': 'School Leaders',
      'gallery.slide6': 'Computer Club',
      'gallery.slide7': 'Creating Green MAKI',
      'gallery.slide8': 'Scout Activities',

      'contact.title': 'Contact Us',
      'contact.sub': 'We would love to hear from you.',
      'contact.address_label': 'Address',
      'contact.address': 'Mashati Kasurua, Rombo District, Kilimanjaro, Tanzania',
      'contact.phone_label': 'Phone',
      'contact.phone': '+255 712 345 678',
      'contact.email_label': 'Email',
      'contact.email': 'info@makihighschool.edu',
      'contact.hours_label': 'Office Hours',
      'contact.hours': 'Monday – Friday, 8:00 am – 4:00 pm',
      'contact.form_title': 'Send Us a Message',
      'contact.form_sub': 'Fill in the form and we will get back to you soon.',
      'contact.label.name': 'Your Name',
      'contact.label.email': 'Your Email',
      'contact.label.message': 'Your Message',
      'contact.placeholder.name': 'Enter your full name',
      'contact.placeholder.email': 'you@example.com',
      'contact.placeholder.message': 'Write your message here...',
      'contact.send': 'Send Message',
      'contact.success': 'Thank you! Your message has been sent successfully.',
      'contact.err.server': 'Something went wrong. Please try again later or email us directly.',
      'contact.err.name': 'Please enter your name.',
      'contact.err.email': 'Please enter your email address.',
      'contact.err.emailInvalid': 'Please enter a valid email address.',
      'contact.err.message': 'Please write a message.',
      'contact.err.summary': 'Please complete the required fields above.',
      'contact.map_title': 'Find Us',

      'academics.title': 'Academics',
      'academics.sub': 'Programmes and curricula that deliver academic excellence.',
      'prog1.title': 'Ordinary Level (Form 1 – 4)',
      'prog1.text': 'A strong foundation in sciences, mathematics, languages and humanities.',
      'prog2.title': 'Advanced Level (Form 5 – 6)',
      'prog2.text': 'Advanced science and humanities subjects preparing students for university.',
      'prog3.title': 'Science & Laboratories',
      'prog3.text': 'Hands-on Chemistry, Biology and Physics in our laboratory.',
      'prog4.title': 'ICT & Modern Learning',
      'prog4.text': 'Computers and digital tools for a modern learning experience.',
      'subjects.title': 'Subjects We Offer',
      'subjects.sub': 'Following the NECTA curriculum for Tanzanian secondary schools.',
      'subjects.list': 'Mathematics · Physics · Chemistry · Biology · Geography · History · English · Kiswahili · Civics · ICT',
      'academics.note': 'Our curriculum follows the official NECTA guidelines for Tanzanian secondary schools.',

      'admissions.title': 'Admissions',
      'admissions.sub': 'Simple steps to begin your journey with MAKI.',
      'step1.title': 'Step 1 — Contact Us',
      'step1.text': 'Reach our office by phone or email for guidance and current details.',
      'step2.title': 'Step 2 — Complete the Form',
      'step2.text': 'Fill in the application form and submit the required documents.',
      'step3.title': 'Step 3 — Visit the Campus',
      'step3.text': 'Tour our campus and see our learning environment for yourself.',
      'step4.title': 'Step 4 — Begin Learning',
      'step4.text': 'Welcome to MAKI! Orientation and school-year details will be provided.',
      'requirements.title': 'Requirements',
      'req1': 'National exam results (SFNA or CSEE)',
      'req2': 'Birth certificate',
      'req3': 'Transfer/character reference letter from previous school',
      'req4': 'Two passport-sized photos',
      'req5': 'Parent or guardian identification',
      'fees.title': 'Fees & Costs',
      'fees.text': 'Fees are set each school year. Please contact our office for the latest fee structure and payment options.',
      'apply.title': 'Begin Your Application Today',
      'apply.text': 'Places are limited. Contact us today to reserve a place for the coming year.',
      'apply.btn': 'Contact Us',

      'news.title': 'News & Announcements',
      'news.empty': 'There is no news at the moment. Please check back later.',
      'news.sub': 'The latest updates from MAKI.',
      'n1.date': 'August 2026',
      'n1.title': 'Welcome to the 2026 – 2027 School Year',
      'n1.text': 'We are excited to welcome back our students and greet new faces as the new academic year begins.',
      'n2.date': 'July 2026',
      'n2.title': 'New Form Five Students Arrive',
      'n2.text': 'Our new Form Five students have arrived on campus and are settling into Advanced Level studies.',
      'n3.date': 'June 2026',
      'n3.title': 'Green MAKI Planting Day',
      'n3.text': 'Students and teachers joined hands to plant trees across the campus as part of our Green MAKI project.',

      'error.code': '404',
      'error.title': 'Page Not Found',
      'error.text': 'Sorry, the page you are looking for does not exist or has been moved.',
      'error.btn': 'Back to Home',

      'footer.about_title': 'About MAKI',
      'footer.about': 'MAKI Secondary School is a secondary school in Mashati Kasurua, Rombo District, Kilimanjaro Region, Tanzania, founded in 2007.',
      'footer.links_title': 'Quick Links',
      'footer.resources_title': 'Resources',
      'footer.contact_title': 'Contact',
      'footer.address': 'Mashati Kasurua, Rombo District, Kilimanjaro, Tanzania',
      'footer.phone': '+255 712 345 678',
      'footer.email': 'info@makihighschool.edu',
      'footer.res1': 'NECTA Timetable 2026',
      'footer.res2': 'Admissions Guide',
      'footer.res3': 'School Gallery',
      'footer.rights': 'All rights reserved.',
      'footer.privacy': 'Privacy',
      'footer.terms': 'Terms'
    },

    sw: {
      'brand.name': 'Shule ya Sekondari MAKI',
      'brand.sub': 'Shule ya Sekondari',
      'nav.home': 'Nyumbani',
      'nav.about': 'Kuhusu Sisi',
      'nav.history': 'Historia',
      'nav.events': 'Matukio',
      'nav.gallery': 'Galeri',
      'nav.contact': 'Mawasiliano',
      'nav.academics': 'Taaluma',
      'nav.admissions': 'Kujiunga',
      'nav.news': 'Habari',

      'announce.text': 'Mahafali ya Kidato cha Sita — Aprili 2026',

      'countdown.days': 'Siku',
      'countdown.hours': 'Saa',
      'countdown.mins': 'Dak',
      'countdown.secs': 'Sek',
      'month.jan': 'Jan',
      'month.feb': 'Feb',
      'month.mar': 'Mac',
      'month.apr': 'Apr',
      'month.may': 'Mei',
      'month.jun': 'Jun',
      'month.jul': 'Jul',
      'month.aug': 'Ago',
      'month.sep': 'Sep',
      'month.oct': 'Okt',
      'month.nov': 'Nov',
      'month.dec': 'Des',
      'resources.r1.title': 'Ratiba ya Mtihani wa NECTA Kidato cha Sita - 2026',
      'events.download': 'Pakua',
      'aria.skip': 'Ruka hadi maudhui makuu',
      'aria.openMenu': 'Fungua menyu',
      'aria.toggleAbout': 'Badilisha menyu ya Kuhusu Sisi',
      'aria.toggleAcademics': 'Badilisha menyu ya Taaluma',
      'aria.closeAnnouncement': 'Funga tangazo',
      'aria.backToTop': 'Rudi juu',
      'aria.light': 'Badilisha hadi hali ya mwanga',
      'aria.dark': 'Badilisha hadi hali ya giza',
      'aria.prevSlide': 'Picha iliyotangulia',
      'aria.nextSlide': 'Picha inayofuata',
      'aria.gotoSlide': 'Nenda kwenye picha {n}',
      'aria.slideOf': 'Picha {n} kati ya {m}',
      'aria.closeLightbox': 'Funga mtazamaji wa picha',
      'aria.prevImage': 'Picha iliyotangulia',
      'aria.nextImage': 'Picha inayofuata',
      'aria.slideshow': 'Onyesho la picha za shule',
      'aria.lightbox': 'Mtazamaji wa picha',
      'aria.social.facebook': 'Facebook',
      'aria.social.instagram': 'Instagram',
      'aria.social.whatsapp': 'WhatsApp',
      'aria.language': 'Lugha',
      'aria.primary': 'Menyu kuu',
      'aria.breadcrumb': 'Mkato',
      'aria.footerLinks': 'Viungo vya haraka',
      'aria.footerResources': 'Rasilimali',
      'aria.galleryOpen1': 'Fungua galeri — Mtazamo wa Juu',
      'aria.galleryOpen2': 'Fungua galeri — Klabu ya Kompyuta',
      'aria.galleryOpen3': 'Fungua galeri — Shughuli za Skauti',

      'hero.eyebrow': 'Elimu · Nidhamu · Ubunifu',
      'hero.title': 'Karibu Shule ya Sekondari MAKI',
      'hero.subtitle': 'Kuwapa wanafunzi maarifa, nidhamu na ubunifu tangu mwaka 2007.',
      'hero.cta1': 'Angalia Historia Yetu',
      'hero.cta2': 'Wasiliana Nasi',
      'hero.meta1': 'Ilianzishwa 2007',
      'hero.meta2': 'Kidato cha 1 – 6',
      'hero.meta3': 'Rombo, Kilimanjaro',

      'welcome.title': 'Karibu MAKI',
      'welcome.sub': 'Shule inayojitolea kwa ubora wa kitaaluma, uongozi na huduma kwa jamii.',
      'f1.title': 'Ubora wa Kitaaluma',
      'f1.text': 'Matokeo imara kupitia mafundisho makini na usaidizi wa karibu kwa kila mwanafunzi.',
      'f2.title': 'Nidhamu na Uadilifu',
      'f2.text': 'Tunalea wanafunzi wenye nidhamu na uadilifu walio tayari kutumikia jamii.',
      'f3.title': 'Ujifunzaji wa Kisasa',
      'f3.text': 'Maabara, ICT na mbinu za kisasa zinazowaandaa wanafunzi kwa siku zijazo.',
      'f4.title': 'Uongozi wa Wanafunzi',
      'f4.text': 'Serikali ya wanafunzi, skauti na klabu hukuza viongozi wa kesho.',
      'f5.title': 'Roho ya Jamii',
      'f5.text': 'Tunatoka vijiji vya Marangu na Kitowo, tunahudumu kwa umoja na maono.',
      'f6.title': 'Michezo na Vipaji',
      'f6.text': 'Tunakuza vipaji katika kandanda, kikapu, sanaa na mengine.',

      'stats.title': 'MAKI kwa Namba',
      'stats.sub': 'Takwimu zinazoonyesha ukuaji na athari zetu.',
      'stats.students': 'Wanafunzi',
      'stats.teachers': 'Walimu',
      'stats.graduates': 'Wahitimu',
      'stats.clubs': 'Klabu na Michezo',

      'features.title': 'Kwanini Uchague MAKI?',
      'features.sub': 'Mchanganyiko wa utamaduni na ubunifu unaomsaidia kila mwanafunzi kufanikiwa.',

      'events.title': 'Matukio Jijayo',
      'events.sub': 'Tarehe muhimu katika kalenda ya shule.',
      'events.page_title': 'Matukio na Rasilimali',
      'events.page_sub': 'Matukio yaliyopita na rasilimali za kupakua.',
      'events.countdown_label': 'Mahafali ya Kidato cha Sita',
      'ev1.date': 'Aprili 17, 2026',
      'ev1.title': 'Mahafali ya Kidato cha Sita',
      'ev1.desc': 'Kusherehekea mafanikio ya wanafunzi wetu wa Kidato cha Sita.',
      'ev2.date': 'Mei 4, 2026',
      'ev2.title': 'Mtihani wa Taifa wa Kidato cha Sita',
      'ev2.desc': 'Mitihani ya NECTA kwa wanafunzi wa Kidato cha Sita.',
      'ev3.date': 'Julai 8, 2026',
      'ev3.title': 'Uwasili wa Kidato cha Tano Kipya',
      'ev3.desc': 'Kuwakaribisha wanafunzi wapya wa Kidato cha Tano chuoni.',
      'tag.upcoming': 'Jijayo',
      'tag.important': 'Muhimu',
      'tag.closed': 'Imekwisha',
      'countdown.until': 'Hadi siku kuu',
      'countdown.done': 'Siku kuu imefika!',
      'countdown.done_text': 'Tutatangaza tarehe mpya hivi karibuni.',
      'events.past_title': 'Matukio Yaliyopita',
      'pe1.date': 'Novemba 2025',
      'pe1.text': 'Mahafali ya Darasa la 2025',
      'pe2.date': 'Oktoba 2025',
      'pe2.text': 'Mashindano ya Mijadala — MAKI nafasi ya 1',
      'pe3.date': 'Septemba 2025',
      'pe3.text': 'Wiki ya Shukrani kwa Walimu',
      'resources.title': 'Rasilimali na Vipakuliwa',
      'resources.sub': 'Nyaraka muhimu kwa wanafunzi, wazazi na walimu.',

      'galleryPreview.title': 'Galeri Yetu',
      'galleryPreview.text': 'Picha kutoka madarasani, viwanja vya michezo na maisha ya utamaduni wa MAKI.',
      'galleryPreview.cta': 'Tazama Galeri Kamili',

      'testimonials.title': 'Wanachosema Wanafunzi na Wazazi',
      'testimonials.sub': 'Maneno ya dhati kutoka familia ya MAKI.',
      't1.quote': 'MAKI ilinipa ujasiri, nidhamu na upendo wa sayansi. Nitawa shukrani walimu wangu daima.',
      't1.author': 'Amina J.',
      't1.role': 'Mwanafunzi wa Kidato cha Sita',
      't2.quote': 'Walimu wanawajali wanafunzi wote. Mtoto wangu amekua kitaaluma na kimaadili.',
      't2.author': 'Joseph M.',
      't2.role': 'Mzazi',
      't3.quote': 'Kutoka Klabu ya Sayansi hadi Skauti, daima kuna kitu cha kujifunza na kufurahia MAKI.',
      't3.author': 'Baraka S.',
      't3.role': 'Mwanafunzi wa Kidato cha Nne',

      'faq.title': 'Maswali Yanayoulizwa Mara kwa Mara',
      'faq.sub': 'Majibu ya haraka kwa maswali ya kawaida.',
      'q1.q': 'Shule ya MAKI iko wapi?',
      'q1.a': 'Tupo Mashati Kasurua, Wilaya ya Rombo, Mkoa wa Kilimanjaro, Tanzania.',
      'q2.q': 'Ni viwango gani shule inatoa?',
      'q2.a': 'Tunatoa elimu ya sekondari kuanzia Kidato cha Kwanza hadi cha Sita (Advanced Level).',
      'q3.q': 'Ni masomo gani yanayotolewa?',
      'q3.a': 'Tunatoa sayansi, hisabati, lugha na ubinadamu kufuatana na mtaala wa NECTA.',
      'q4.q': 'Ninaomba kujiunga vipi?',
      'q4.a': 'Wasiliana na ofisi yetu kwa mwongozo, kamilisha fomu ya maombi, na tembelea kampasi. Tazama ukurasa wa Kujiunga kwa maelezo.',
      'q5.q': 'Je, kuna michezo na klabu?',
      'q5.a': 'Ndiyo. Kandanda, kikapu, Skauti, Klabu ya Kompyuta na mradi wa Green MAKI ni sehemu ya maisha ya shule.',
      'q6.q': 'Je, shule hutoa chakula na maji?',
      'q6.a': 'Tafadhali wasiliana na ofisi yetu kwa maelezo kuhusu bweni na vifaa.',

      'cta.title': 'Uko tayari kujiunga na familia ya MAKI?',
      'cta.text': 'Tembelea kampasi yetu au wasiliana nasi leo kujifunza zaidi kuhusu kujiunga.',
      'cta.btn1': 'Wasiliana Nasi',
      'cta.btn2': 'Soma Zaidi',

      'about.title': 'Kuhusu Shule ya Sekondari MAKI',
      'about.sub': 'Sisi ni nani na tunasimamia nini.',
      'mission.title': 'Dhamira Yetu',
      'mission.text': 'Kuwalea wanafunzi kwa misingi imara ya kitaaluma, nidhamu na ubunifu, tukiwaandaa kuchangia jamii kwa maana.',
      'vision.title': 'Maono Yetu',
      'vision.text': 'Kuwa taasisi inayoongoza inayotambulika kwa ubora wa taaluma, ubunifu na huduma kwa jamii.',
      'values.title': 'Maadili Yetu',
      'values.text': 'Kanuni zinazotuongoza kila siku.',
      'v1': 'Uadilifu na nidhamu',
      'v2': 'Kujitolea kwa ubora',
      'v3': 'Heshima kwa utofauti',
      'v4': 'Huduma kwa jamii',
      'v5': 'Kazi ya pamoja',
      'v6': 'Uwajibikaji',

      'history.title': 'Historia Yetu',
      'history.sub': 'Kutoka vijiji viwili hadi ubora wa kitaaluma.',
      'history.ch1.year': '2007',
      'history.ch1.title': 'Uanzishaji wa MAKI',
      'history.ch1.text': 'Shule ya Sekondari MAKI ilianzishwa katikati ya Kilimanjaro. Jina lake linachanganya vijiji viwili — Marangu na Kitowo — likiashiria umoja na matumaini. Ilianza na walimu 5, wanafunzi 102 na vibanda viwili vya madarasa.',
      'history.ch2.year': '2007–2020',
      'history.ch2.title': 'Kupanda Kutokana na Changamoto',
      'history.ch2.text': 'Miaka ya mwanzo ilileta uhaba wa maji, ukosefu wa walimu na vifaa vichache. Hata hivyo, shule ilibaki imara ikijifunza kuwa ustahimilivu unaweza kubadilisha maisha.',
      'history.ch3.year': '2010',
      'history.ch3.title': 'Maabara ya Kwanza ya Sayansi',
      'history.ch3.text': 'Shule ilijenga maabara yake ya kwanza ya sayansi, ikifungua enzi mpya ya kujifunza kwa vitendo katika Kemia na Biolojia.',
      'history.ch4.year': '2020',
      'history.ch4.title': 'Walimu Wapya, Nguvu Mpya',
      'history.ch4.text': 'Walimu wa uwanja walileta ujuzi mpya. Kujitolea kwa Sir Vitus Mwanankulu katika Kemia kulitambuliwa kwa cheti cha utukufu na Waziri wa Elimu, Adolf Mkenda.',
      'history.ch5.year': '2024',
      'history.ch5.title': 'Kidato cha Tano (Advanced Level)',
      'history.ch5.text': 'Kupitia juhudi za Dr. Steve Moshi, MAKI ilianzisha masomo ya Advanced Level. Darasa la kwanza la Kidato cha Tano lilikaribisha wanafunzi 66 — wavulana 33 na wasichana 33.',
      'history.ch6.year': 'Leo',
      'history.ch6.title': 'Maono ya Baadaye',
      'history.ch6.text': 'MAKI inaendelea kukua katika taaluma, michezo na uongozi — kupanua viwanja, kuboresha maji na kuimarisha Skauti na serikali ya wanafunzi.',
      'motto.title': 'Kauli Mbiu Zetu',
      'motto.sub': 'Kanuni tunazosimamia.',
      'motto1.title': 'Elimu',
      'motto1.text': 'Kujifunza kwa manufaa ya jamii',
      'motto2.title': 'Nidhamu',
      'motto2.text': 'Msingi wa maisha bora',
      'motto3.title': 'Huduma',
      'motto3.text': 'Kujitolea kwa jamii yetu',

      'gallery.title': 'Galeri ya Shule',
      'gallery.sub': 'Picha kutoka madarasani, viwanja vya michezo na matukio ya kitamaduni.',
      'gallery.slideshow': 'Picha Zilizochaguliwa',
      'filter.all': 'Zote',
      'filter.campus': 'Kampasi',
      'filter.events': 'Matukio',
      'filter.students': 'Wanafunzi',
      'filter.clubs': 'Klabu',
      'gallery.slide1': 'Muonekano wa Juu — Jengo Kuu',
      'gallery.slide2': 'Muonekano wa Juu — Uwanja wa Michezo',
      'gallery.slide3': 'Muonekano wa Jumla wa Shule',
      'gallery.slide4': 'Siku ya Sanaa',
      'gallery.slide5': 'Viongozi wa Shule',
      'gallery.slide6': 'Klabu ya Kompyuta',
      'gallery.slide7': 'Kuunda Maki Kijani',
      'gallery.slide8': 'Shughuli za Skauti',

      'contact.title': 'Wasiliana Nasi',
      'contact.sub': 'Tungependa kusikia kutoka kwako.',
      'contact.address_label': 'Anwani',
      'contact.address': 'Mashati Kasurua, Wilaya ya Rombo, Kilimanjaro, Tanzania',
      'contact.phone_label': 'Simu',
      'contact.phone': '+255 712 345 678',
      'contact.email_label': 'Barua Pepe',
      'contact.email': 'info@makihighschool.edu',
      'contact.hours_label': 'Saa za Kazi',
      'contact.hours': 'Jumatatu – Ijumaa, 8:00 asubuhi – 4:00 jioni',
      'contact.form_title': 'Tutumie Ujumbe',
      'contact.form_sub': 'Jaza fomu hii na tutakujibu hivi karibuni.',
      'contact.label.name': 'Jina Lako',
      'contact.label.email': 'Barua Pepe Yako',
      'contact.label.message': 'Ujumbe Wako',
      'contact.placeholder.name': 'Ingiza jina lako kamili',
      'contact.placeholder.email': 'wewe@mfano.com',
      'contact.placeholder.message': 'Andika ujumbe wako hapa...',
      'contact.send': 'Tuma Ujumbe',
      'contact.success': 'Asante! Ujumbe wako umetumwa kikamilifu.',
      'contact.err.server': 'Kuna tatizo. Tafadhali jaribu tena baadaye au tutumie barua pepe moja kwa moja.',
      'contact.err.name': 'Tafadhali ingiza jina lako.',
      'contact.err.email': 'Tafadhali ingiza barua pepe yako.',
      'contact.err.emailInvalid': 'Tafadhali ingiza barua pepe sahihi.',
      'contact.err.message': 'Tafadhali andika ujumbe wako.',
      'contact.err.summary': 'Tafadhali kamilisha sehemu zilizotakiwa hapo juu.',
      'contact.map_title': 'Tupo Hapa',

      'academics.title': 'Taaluma',
      'academics.sub': 'Programu na mitaala inayotoa ubora wa kitaaluma.',
      'prog1.title': 'Elimu ya Sekondari (Kidato 1 – 4)',
      'prog1.text': 'Msingi imara wa sayansi, hisabati, lugha na ubinadamu.',
      'prog2.title': 'Advanced Level (Kidato 5 – 6)',
      'prog2.text': 'Masomo ya juu ya sayansi na ubinadamu yanayowaandaa wanafunzi kwa chuo kikuu.',
      'prog3.title': 'Sayansi na Maabara',
      'prog3.text': 'Kemia, Biolojia na Fizikia kwa kujifunza kwa vitendo maabarani.',
      'prog4.title': 'ICT na Ujifunzaji wa Kisasa',
      'prog4.text': 'Kompyuta na zana za kidijitali kwa uzoefu wa kisasa wa kujifunza.',
      'subjects.title': 'Masomo Tunayotoa',
      'subjects.sub': 'Kufuatana na mtaala wa NECTA kwa shule za sekondari za Tanzania.',
      'subjects.list': 'Hisabati · Fizikia · Kemia · Biolojia · Jiografia · Historia · Kiingereza · Kiswahili · Uraia · ICT',
      'academics.note': 'Mtaala wetu unafuata mwongozo rasmi wa NECTA kwa shule za sekondari za Tanzania.',

      'admissions.title': 'Kujiunga',
      'admissions.sub': 'Hatua rahisi za kuanza safari yako na MAKI.',
      'step1.title': 'Hatua 1 — Wasiliana Nasi',
      'step1.text': 'Fikia ofisi yetu kwa simu au barua pepe kwa mwongozo na maelezo ya sasa.',
      'step2.title': 'Hatua 2 — Kamilisha Fomu',
      'step2.text': 'Jaza fomu ya maombi na toa nyaraka zinazohitajika.',
      'step3.title': 'Hatua 3 — Tembelea Kampasi',
      'step3.text': 'Zuru kampasi yetu na ujione mazingira yetu ya kujifunzia.',
      'step4.title': 'Hatua 4 — Anza Kujifunza',
      'step4.text': 'Karibu MAKI! Mwongozo na maelezo ya mwaka wa shule yatatolewa.',
      'requirements.title': 'Mahitaji',
      'req1': 'Matokeo ya mtihani wa taifa (SFNA au CSEE)',
      'req2': 'Cheti cha kuzaliwa',
      'req3': 'Barua ya uhamisho/maadili kutoka shule iliyotangulia',
      'req4': 'Picha mbili za pasipoti',
      'req5': 'Kitambulisho cha mzazi au mlezi',
      'fees.title': 'Ada na Gharama',
      'fees.text': 'Ada huwekwa kila mwaka wa shule. Tafadhali wasiliana na ofisi yetu kwa muundo wa ada na chaguzi za malipo.',
      'apply.title': 'Anza Maombi Yako Leo',
      'apply.text': 'Nafasi ni chache. Wasiliana nasi leo kuweka nafasi kwa mwaka ujao.',
      'apply.btn': 'Wasiliana Nasi',

      'news.title': 'Habari na Tangazo',
      'news.empty': 'Hakuna habari kwa sasa. Tafadhali rudi baadaye.',
      'news.sub': 'Taarifa za hivi karibuni kutoka MAKI.',
      'n1.date': 'Agosti 2026',
      'n1.title': 'Karibu Mwaka wa Shule 2026 – 2027',
      'n1.text': 'Tunafurahi kuwarudisha wanafunzi wetu na kuwakaribisha wapya mwaka huu wa shule.',
      'n2.date': 'Julai 2026',
      'n2.title': 'Wanafunzi Wapya wa Kidato cha Tano Wafika',
      'n2.text': 'Wanafunzi wetu wapya wa Kidato cha Tano wamefika chuoni na wanaanza masomo ya Advanced Level.',
      'n3.date': 'Juni 2026',
      'n3.title': 'Siku ya Kupanda Miti ya Green MAKI',
      'n3.text': 'Wanafunzi na walimu waliungana kupanda miti kampasi nzima kama sehemu ya mradi wa Green MAKI.',

      'error.code': '404',
      'error.title': 'Ukurasa Haupatikani',
      'error.text': 'Samahani, ukurasa unaoutafuta haupo au umehamishwa.',
      'error.btn': 'Rudi Nyumbani',

      'footer.about_title': 'Kuhusu MAKI',
      'footer.about': 'Shule ya Sekondari MAKI ni shule ya sekondari iliyoko Mashati Kasurua, Wilaya ya Rombo, Mkoa wa Kilimanjaro, Tanzania, iliyoanzishwa mwaka 2007.',
      'footer.links_title': 'Viungo vya Haraka',
      'footer.resources_title': 'Rasilimali',
      'footer.contact_title': 'Mawasiliano',
      'footer.address': 'Mashati Kasurua, Wilaya ya Rombo, Kilimanjaro, Tanzania',
      'footer.phone': '+255 712 345 678',
      'footer.email': 'info@makihighschool.edu',
      'footer.res1': 'Jedwali la NECTA 2026',
      'footer.res2': 'Mwongozo wa Kujiunga',
      'footer.res3': 'Galeri ya Shule',
      'footer.rights': 'Haki zote zimehifadhiwa.',
      'footer.privacy': 'Faragha',
      'footer.terms': 'Masharti'
    }
  };

  /* ----------------------------------------------------------------------
     17. Language toggle
     ---------------------------------------------------------------------- */
  var currentLang = 'en';
  try { currentLang = localStorage.getItem('maki-lang') || 'en'; } catch (e) { /* ignore */ }
  if (currentLang !== 'en' && currentLang !== 'sw') currentLang = 'en';

  function updateDynamicAria(lang) {
    var dict = translations[lang] || translations['en'];

    if (themeBtn) {
      var themeKey = root.getAttribute('data-theme') === 'dark' ? 'aria.light' : 'aria.dark';
      var themeLabel = dict[themeKey] || translations['en'][themeKey];
      if (themeLabel) themeBtn.setAttribute('aria-label', themeLabel);
    }

    document.querySelectorAll('[data-aria-key]').forEach(function (el) {
      var key = el.getAttribute('data-aria-key');
      var val = dict[key] || translations['en'][key];
      if (val) el.setAttribute('aria-label', val);
    });
  }

  function applyTranslations(lang) {
    var dict = translations[lang] || translations['en'];
    var fallback = translations['en'];

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var html = dict[key] || fallback[key] || el.innerHTML;
      el.innerHTML = html;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var attr = el.getAttribute('data-i18n-attr');
      var key = el.getAttribute('data-i18n');
      if (!attr || !key) return;
      var value = dict[key] || fallback[key] || el.getAttribute(attr) || '';
      el.setAttribute(attr, value);
    });

    document.querySelectorAll('.lang-option').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    renderGalleryCaptions();
    updateDynamicAria(lang);
    updateSlideshowAria();
    if (window.MAKI.translateAfter) window.MAKI.translateAfter(lang);
  }

  function setLang(lang) {
    currentLang = lang;
    window.MAKI.lang = lang;
    try { localStorage.setItem('maki-lang', lang); } catch (e) { /* ignore */ }
    applyTranslations(lang);
    if (document.documentElement) document.documentElement.setAttribute('lang', lang === 'sw' ? 'sw' : 'en');
  }

  document.querySelectorAll('.lang-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang') === 'sw' ? 'sw' : 'en');
    });
  });

  /* ----------------------------------------------------------------------
     18. Wire up MAKI namespace
     ---------------------------------------------------------------------- */
  window.MAKI = window.MAKI || {};
  window.MAKI.translations = translations;
  window.MAKI.translate = applyTranslations;
  window.MAKI.resources = [
    {
      title: 'Form Six NECTA Examination Timetable — 2026',
      titleKey: 'resources.r1.title',
      file: 'assets/necta-form6-timetable-2026.pdf',
      size: 'PDF · 2026'
    }
  ];

  window.MAKI.translateAfter = function (lang) {
    var dict = translations[lang] || translations['en'];
    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    var rights = document.getElementById('footer-rights');
    if (rights) rights.textContent = dict['footer.rights'];
  };

  setLang(currentLang);
  initResources();
})();
