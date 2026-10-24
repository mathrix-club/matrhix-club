/* Site script: brand binding, hash router, Study Hub, team, contact and form. */
(function () {
  'use strict';

  var CFG = window.MATHRIX_CONFIG;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DATA = window.MATHRIX_STUDY || [];

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(id, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>';
  }
  function telHref(phone) { return 'tel:' + String(phone).replace(/[^\d+]/g, ''); }
  function waHref(number, text) {
    return 'https://wa.me/' + String(number).replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  var RES = {
    notes: { label: 'Notes', icon: 'notes' },
    pdf: { label: 'PDFs', icon: 'pdf' },
    worksheet: { label: 'Worksheets', icon: 'worksheet' }
  };
  var SUBJECT_LABEL = { math: 'Math', mechanics: 'Mechanics' };

  /* ---------- brand: SITE_BRAND_NAME and SITE_TAGLINE from config.js ---------- */
  var BRAND = window.SITE_BRAND_NAME || 'MATHRIX';
  var TAGLINE = window.SITE_TAGLINE || '';
  // data-brand fills in the name (data-brand="lower" for lowercase); data-brand-attr="attr:text with {brand}" sets an attribute
  $$('[data-brand]').forEach(function (el) { el.textContent = el.getAttribute('data-brand') === 'lower' ? BRAND.toLowerCase() : BRAND; });
  // *word* in the tagline is set in the italic serif; plain-text places drop the asterisks
  function accent(s) { return esc(s).replace(/\*([^*]+)\*/g, '<em class="serif">$1</em>'); }
  $$('[data-tagline]').forEach(function (el) { el.textContent = TAGLINE.replace(/\*/g, ''); });
  // the hero headline sets the tagline in two weights, split before " for "
  var cut = TAGLINE.indexOf(' for ');
  var TAG = cut > 0 ? [TAGLINE.slice(0, cut), TAGLINE.slice(cut + 1)] : [TAGLINE, ''];
  $$('[data-tagline-part]').forEach(function (el) {
    var t = TAG[el.getAttribute('data-tagline-part') === '1' ? 0 : 1];
    el.innerHTML = accent(t);
    el.hidden = !t;
  });

  /* ---------- palette: Nordic Study (default), Carbon Pro, Editorial Paper ---------- */
  var THEMES = ['focus', 'black', 'light'];
  var THEME_COLOR = { focus: '#11161d', black: '#09090b', light: '#f5f4f0' };
  var themeEl = $('#theme-switch');
  var themeOpts = $$('.theme-opt', themeEl);
  var themeTimer = 0;
  function setTheme(t, user) {
    var root = document.documentElement;
    if (user && !reduceMotion) {
      // colours ease across for a moment, then normal transitions return
      root.classList.add('theme-anim');
      clearTimeout(themeTimer);
      themeTimer = setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
    }
    root.setAttribute('data-theme', t);
    themeEl.setAttribute('data-active', t);
    themeOpts.forEach(function (b) {
      var on = b.getAttribute('data-theme-opt') === t;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[t]);
    if (user) { try { localStorage.setItem('mathrix-theme', t); } catch (e) { /* the choice lasts for this visit */ } }
    document.dispatchEvent(new CustomEvent('mathrix:theme', { detail: t }));
  }
  themeOpts.forEach(function (b, i) {
    b.addEventListener('click', function () { setTheme(b.getAttribute('data-theme-opt'), true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = themeOpts[(i + d + themeOpts.length) % themeOpts.length];
      setTheme(next.getAttribute('data-theme-opt'), true);
      next.focus();
    });
  });
  // every Join button opens the club's application form
  $$('[data-join]').forEach(function (a) { a.href = CFG.joinUrl; });

  var saved = document.documentElement.getAttribute('data-theme');
  setTheme(THEMES.indexOf(saved) >= 0 ? saved : 'focus', false);
  $$('[data-brand-attr]').forEach(function (el) {
    var spec = el.getAttribute('data-brand-attr'), i = spec.indexOf(':');
    el.setAttribute(spec.slice(0, i), spec.slice(i + 1).split('{brand}').join(BRAND));
  });

  /* ---------- router ---------- */
  var VIEWS = ['home', 'study', 'team', 'contact'];
  var TITLES = {
    home: BRAND + ' | Math & Mechanics Club',
    study: 'Study Hub | ' + BRAND,
    team: 'Team and leadership | ' + BRAND,
    contact: 'Contact and socials | ' + BRAND
  };
  var firstRoute = true;

  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, '');
    var parts = raw.split('?');
    var name = parts[0] || 'home';
    return { view: VIEWS.indexOf(name) >= 0 ? name : 'home', params: new URLSearchParams(parts[1] || '') };
  }

  function route() {
    var r = parseHash();
    $$('[data-view]').forEach(function (s) { s.hidden = s.getAttribute('data-view') !== r.view; });
    $$('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === r.view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = TITLES[r.view];
    var sb = document.getElementById('sb-page');
    if (sb) sb.textContent = { home: 'HOME', study: 'STUDY HUB', team: 'TEAM', contact: 'CONTACT' }[r.view];
    closeMenu();
    moveDock();
    closeWorkbench(false);

    if (r.view === 'study') applyStudyParams(r.params);

    var section = $('[data-view="' + r.view + '"]');
    section.classList.remove('view-enter');
    void section.offsetWidth; // restart the transition
    section.classList.add('view-enter');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    if (!firstRoute && !wbOpen()) {
      var h = $('h1', section);
      if (h) h.focus({ preventScroll: true });
    }
    firstRoute = false;
  }

  /* "About the club" scrolls to the section without touching the route hash. */
  $('#about-link').addEventListener('click', function (e) {
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('#about').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- mobile menu ---------- */
  var menuBtn = $('#menu-btn');
  var mobileNav = $('#mobile-nav');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.hidden = !open;
    $('[data-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-close]', menuBtn).classList.toggle('hidden', !open);
  }
  function closeMenu() { setMenu(false); }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { closeMenu(); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);

  /* ---------- Main nav: sliding indicator in the pill dock ---------- */
  var dockEl = $('.dock');
  var dockInd = $('.dock-indicator');
  function moveDock() {
    if (!dockEl || !dockInd) return;
    var a = $('.nav-link[aria-current="page"]', dockEl);
    if (!a || !a.offsetWidth) { dockInd.style.opacity = '0'; return; }
    dockInd.style.opacity = '1';
    dockInd.style.width = a.offsetWidth + 'px';
    dockInd.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  window.addEventListener('resize', moveDock);
  window.addEventListener('load', moveDock);
  if (document.fonts) {
    // the display font changes link widths once it arrives
    if (document.fonts.ready) document.fonts.ready.then(moveDock);
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', moveDock);
  }

  /* ---------- Study Hub: bento folders ---------- */
  var PLAYLISTS = CFG.playlists || [];
  var FORMULAS = window.MATHRIX_FORMULAS || {};
  var SUBJECTS = [{ id: 'math', label: 'Math' }, { id: 'mechanics', label: 'Mechanics' }];
  var state = { grade: '10', subject: 'all', q: '' };
  var bentoEl = $('#bento');
  var countEl = $('#study-count');
  var searchEl = $('#study-search');
  var panelEl = $('#study-panel');
  var gradeTabsEl = $('.tabs');
  var tabs = $$('.tab');
  var segBtns = $$('.seg-btn');
  var SR_NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';

  $('#drive-cta').href = CFG.driveRoot;
  $('#pl-all').href = CFG.playlistsUrl;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function searching() { return state.q.trim() !== ''; }
  function matches(text) {
    var q = state.q.trim().toLowerCase();
    return !q || text.toLowerCase().indexOf(q) >= 0;
  }

  /* One entry per topic, holding its concept folders, in subject order. */
  function topicsForGrade(grade) {
    var list = [];
    SUBJECTS.forEach(function (s) {
      DATA.forEach(function (d) {
        if (d.grade !== grade || d.subject !== s.id) return;
        var t = list.filter(function (x) { return x.subject === s.id && x.topic === d.topic; })[0];
        if (!t) { t = { grade: grade, subject: s.id, topic: d.topic, items: [] }; list.push(t); }
        t.items.push(d);
      });
    });
    return list;
  }
  function topicKey(t) { return t.grade + '/' + t.subject + '/' + t.topic; }
  function findTopic(key) { return topicsForGrade(key.split('/')[0]).filter(function (t) { return topicKey(t) === key; })[0]; }
  function playlistsFor(t) { return PLAYLISTS.filter(function (p) { return p.grade === t.grade && p.subject === t.subject; }); }
  function resCount(t, kind) { return t.items.filter(function (d) { return d.resources.indexOf(kind) >= 0; }).length; }
  function topicText(t) {
    return [t.topic, SUBJECT_LABEL[t.subject]].concat(t.items.map(function (d) { return d.title + ' ' + d.summary; })).join(' ');
  }

  /* Progress: completed topics live in localStorage, so they stay on this device only. */
  var PROGRESS_KEY = 'mathrix-progress-v1';
  var done = {};
  try { done = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch (e) { done = {}; }
  function saveDone() { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(done)); } catch (e) { /* private mode: progress lasts for this visit */ } }

  function renderProgress() {
    var all = topicsForGrade(state.grade);
    var n = all.filter(function (t) { return done[topicKey(t)]; }).length;
    var pct = all.length ? Math.round(n / all.length * 100) : 0;
    $('#progress-count').textContent = pad(n) + ' / ' + pad(all.length) + ' completed';
    $('.progress-track').setAttribute('aria-valuetext', n + ' of ' + all.length + ' Grade ' + state.grade + ' topics completed');
    $('#progress-fill').style.transform = 'scaleX(' + pct / 100 + ')';
    $('.progress-track').setAttribute('aria-valuenow', String(pct));
  }

  /* Micro-graphics. SVG motion is SMIL, paused until the card is hovered or focused. */
  var FX = {
    grid: '<path class="fx-grid" d="M10 10V90M40 10V90M70 10V90M100 10V90M130 10V90M10 10H130M10 36.7H130M10 63.3H130M10 90H130"/>' +
      '<path class="fx-axis" d="M10 90H134M10 90V6"/>',
    curve: 'M12 84C40 82 58 66 70 50S100 14 128 12',
    abs: 'M16 14L70 80L124 14',
    arc: 'M14 88Q70 -10 126 88'
  };
  function fxTangent(path) {
    return '<svg class="fx fx-svg" data-fx="tangent" viewBox="0 0 140 100" aria-hidden="true" focusable="false">' + FX.grid +
      '<path class="fx-path" d="' + path + '"/>' +
      '<g class="fx-tan fx-auto"><path d="M-24 0H24"/><circle r="3"/>' +
        '<animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="0.08;0.92;0.08" keyTimes="0;0.5;1" path="' + path + '"/></g>' +
      '<g class="fx-tan fx-steer"><path d="M-24 0H24"/><circle r="3"/></g>' +
    '</svg>';
  }
  var sineId = 0;
  function fxSine() {
    // a long wave slides left by one period, so the loop is seamless; the clip keeps it inside the grid
    var id = 'fx-clip-' + (sineId++), d = 'M-30 50', x, k;
    for (k = 0, x = -30; x < 170; k++, x += 20) d += ' Q' + (x + 10) + ' ' + (k % 2 ? 82 : 18) + ' ' + (x + 20) + ' 50';
    return '<svg class="fx fx-svg" data-fx="sine" viewBox="0 0 140 100" aria-hidden="true" focusable="false">' + FX.grid +
      '<defs><clipPath id="' + id + '"><rect x="10" y="6" width="124" height="84"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + ')"><g class="fx-wave"><path class="fx-path" d="' + d + '">' +
        '<animateTransform attributeName="transform" type="translate" from="0 0" to="-40 0" dur="2.6s" repeatCount="indefinite"/></path></g></g>' +
      '<circle class="fx-sine-dot" cx="70" cy="50" r="3"/>' +
    '</svg>';
  }
  function fxProjectile() {
    return '<svg class="fx fx-svg" data-fx="proj" viewBox="0 0 140 100" aria-hidden="true" focusable="false">' +
      '<path class="fx-axis" d="M8 88H134"/>' +
      '<path class="fx-path fx-dash" d="' + FX.arc + '"/>' +
      '<g class="fx-vec fx-vec-v"><path d="M14 88L38 64M30 63.5H38.5V72"/></g>' +
      '<g class="fx-vec fx-vec-g"><path d="M70 47V71M65 64.5L70 71.5L75 64.5"/></g>' +
      '<g class="fx-ball fx-auto"><circle r="3.6"/><animateMotion dur="2.4s" repeatCount="indefinite" path="' + FX.arc + '"/></g>' +
      '<g class="fx-ball fx-steer"><circle r="3.6"/><path class="fx-ball-v" d="M0 0H18"/></g>' +
    '</svg>';
  }
  function fxCube() {
    return '<div class="fx fx-cube" data-fx="cube" aria-hidden="true"><div class="cube"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>';
  }
  function fxFor(t) {
    if (t.subject === 'mechanics') return fxProjectile();
    if (t.topic === 'Geometry') return fxCube();
    if (t.topic === 'Functions') return fxTangent(FX.abs);
    if (t.topic === 'Algebra') return fxSine();
    return fxTangent(FX.curve);
  }
  function setLive(card, on) {
    if (!card) return;
    card.classList.toggle('is-live', on && !reduceMotion);
    $$('svg.fx-svg', card).forEach(function (s) {
      if (!s.pauseAnimations) return;
      if (on && !reduceMotion) s.unpauseAnimations(); else s.pauseAnimations();
    });
  }

  /* Rows of a 6-column grid: a wide card (4) beside a narrow one (2), then three equal, and so on. */
  function spans(n) {
    var rows = [[4, 2], [2, 2, 2], [2, 4], [3, 3]], out = [], r = 0;
    while (out.length < n) {
      var row = rows[r % rows.length], left = n - out.length;
      if (left < row.length) row = left === 1 ? [6] : [3, 3];
      out = out.concat(row.slice(0, left));
      r++;
    }
    return out;
  }

  function doneButton(key) {
    var on = !!done[key];
    return '<button type="button" class="bento-done' + (on ? ' is-done' : '') + '" data-done="' + esc(key) + '" aria-pressed="' + on + '">' +
      icon('check', 'icon-sm') + '<span>' + (on ? 'Completed' : 'Mark complete') + '</span></button>';
  }

  /* A folder card: two glass sheets behind, a tab on top, the diagram, then number, topic and contents. */
  function card(t, span, i) {
    var key = topicKey(t), n = t.items.length, pls = playlistsFor(t).length;
    var res = ['notes', 'pdf', 'worksheet'].map(function (k) {
      return '<span><b>' + pad(resCount(t, k)) + '</b> ' + RES[k].label + '</span>';
    }).join('');
    var shown = t.items.slice(0, span >= 4 ? 3 : 2);
    return '<article class="bento-card' + (span >= 4 ? ' is-wide' : '') + (done[key] ? ' is-done' : '') + '" role="listitem" data-subject="' + t.subject + '" data-key="' + esc(key) + '" style="--span:' + span + '">' +
      '<span class="bento-face" aria-hidden="true"></span>' +
      '<span class="bento-tab" aria-hidden="true"><b>' + pad(i + 1) + '</b> ' + esc(SUBJECT_LABEL[t.subject]) + '</span>' +
      '<div class="bento-media" aria-hidden="true">' +
        fxFor(t) +
        '<span class="bento-launch">Launch workbench <span class="bento-arrow">\u2192</span></span>' +
      '</div>' +
      '<div class="bento-body">' +
        '<p class="bento-tele"><span>' + pad(i + 1) + ' // ' + esc(t.topic.toUpperCase()) + '</span>' +
          '<span>G' + t.grade + '</span>' +
          '<span><b>' + pad(n) + '</b> ' + (n === 1 ? 'folder' : 'folders') + '</span>' +
          '<span><b>' + pad(pls) + '</b> ' + (pls === 1 ? 'playlist' : 'playlists') + '</span></p>' +
        '<h3 class="bento-title font-display"><button type="button" class="bento-open" data-open="' + esc(key) + '" aria-haspopup="dialog">' +
          esc(t.topic) + '</button></h3>' +
        '<ul class="bento-items">' + shown.map(function (d) { return '<li>' + esc(d.title) + '</li>'; }).join('') +
          (n > shown.length ? '<li class="bento-more">+' + (n - shown.length) + ' more</li>' : '') + '</ul>' +
        '<div class="bento-foot"><p class="bento-res">' + res + '</p>' + doneButton(key) + '</div>' +
      '</div>' +
    '</article>';
  }

  function renderBento() {
    var list = topicsForGrade(state.grade).filter(function (t) {
      return (state.subject === 'all' || state.subject === t.subject) && matches(topicText(t));
    });
    bentoEl.setAttribute('aria-label', 'Grade ' + state.grade + ' topics');
    var folders = 0, subs = [];
    list.forEach(function (t) { folders += t.items.length; if (subs.indexOf(t.subject) < 0) subs.push(t.subject); });
    var pls = PLAYLISTS.filter(function (p) { return p.grade === state.grade && subs.indexOf(p.subject) >= 0; }).length;
    countEl.textContent = list.length + (list.length === 1 ? ' topic, ' : ' topics, ') +
      folders + (folders === 1 ? ' concept folder' : ' concept folders') + ' and ' + pls + (pls === 1 ? ' playlist' : ' playlists') + ' in Grade ' + state.grade;

    if (!list.length) {
      bentoEl.innerHTML = '<div class="empty glass" role="listitem">' +
        '<p class="font-display empty-title">No topic matches that search</p>' +
        '<p>Try a shorter word, or clear the search to see every Grade ' + state.grade + ' topic.</p>' +
        '<button type="button" class="interactive-hover-btn" data-clear>Clear search</button></div>';
    } else {
      if (cardObserver) cardObserver.disconnect();   // the old cards are about to be replaced
      var sp = spans(list.length);
      bentoEl.innerHTML = list.map(function (t, i) { return card(t, sp[i], i); }).join('');
      $$('.bento-card', bentoEl).forEach(function (c) {
        setLive(c, false);
        if (cardObserver) cardObserver.observe(c);
      });
    }
    renderProgress();
  }

  function renderPlaylists() {
    var list = PLAYLISTS.filter(function (p) { return p.grade === state.grade; });
    $('#pl-title').textContent = 'Grade ' + state.grade + ' video playlists';
    $('#playlist-list').innerHTML = list.length ? list.map(function (p) {
      return '<li><a class="pl-btn" data-subject="' + p.subject + '" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' +
        icon('play', 'icon-md') + (p.lo ? '<span class="pl-lo">' + esc(p.lo) + '</span>' : '') +
        '<span class="pl-name">' + esc(p.title) + '</span>' + icon('external', 'icon-sm') + SR_NEW_TAB + '</a></li>';
    }).join('') : '<li class="pl-empty">Playlists for this grade are coming soon.</li>';
  }

  function syncStudyUI() {
    $('#drive-cta-title').textContent = 'Grade ' + state.grade + ' resources on Google Drive';
    gradeTabsEl.setAttribute('data-grade', state.grade);
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-grade') === state.grade;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) panelEl.setAttribute('aria-labelledby', t.id);
    });
    segBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-subject') === state.subject)); });
    if (searchEl.value !== state.q) searchEl.value = state.q;
    renderPlaylists();
    renderBento();
  }

  function applyStudyParams(params) {
    var changed = false;
    var g = params.get('grade'), s = params.get('subject'), t = params.get('topic');
    var q = params.get('q');
    if (g === '10' || g === '11') { state.grade = g; changed = true; }
    if (s === 'math' || s === 'mechanics' || s === 'all') { state.subject = s; changed = true; }
    if (q !== null || t || s) { state.q = q || ''; changed = true; }   // a link without q clears an old search
    if (changed || !bentoEl.children.length) syncStudyUI();
    if (t) {
      // a topic link opens that topic's workbench
      var match = topicsForGrade(state.grade).filter(function (x) {
        return x.topic === t && (state.subject === 'all' || x.subject === state.subject);
      })[0];
      if (match) openWorkbench(match, null);
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { state.grade = tab.getAttribute('data-grade'); syncStudyUI(); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); next.focus(); next.click(); }
    });
  });
  segBtns.forEach(function (b) {
    b.addEventListener('click', function () { state.subject = b.getAttribute('data-subject'); syncStudyUI(); });
  });
  searchEl.addEventListener('input', function () { state.q = searchEl.value; renderBento(); });

  bentoEl.addEventListener('click', function (e) {
    var tog = e.target.closest('[data-done]');
    if (tog) {
      var key = tog.getAttribute('data-done');
      if (done[key]) delete done[key]; else done[key] = true;
      saveDone();
      var on = !!done[key];
      tog.setAttribute('aria-pressed', String(on));
      tog.classList.toggle('is-done', on);
      tog.closest('.bento-card').classList.toggle('is-done', on);
      $('span', tog).textContent = on ? 'Completed' : 'Mark complete';
      renderProgress();
      return;
    }
    var open = e.target.closest('[data-open]');
    if (open) { openWorkbench(findTopic(open.getAttribute('data-open')), open); return; }
    if (e.target.closest('[data-clear]')) {
      state.q = ''; state.subject = 'all';
      syncStudyUI();
      searchEl.focus();
    }
  });

  /* Hover or focus wakes a card's graphic; the pointer also drives a soft spotlight. */
  var liveCard = null;
  // diagrams run while their card is on screen; without IntersectionObserver they run on hover or focus
  var cardObserver = !reduceMotion && 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { setLive(e.target, e.isIntersecting); });
  }, { threshold: 0.2 }) : null;
  function wake(c) { if (cardObserver || c === liveCard) return; setLive(liveCard, false); liveCard = c; setLive(c, true); }
  bentoEl.addEventListener('pointerover', function (e) { if (e.pointerType !== 'touch') wake(e.target.closest('.bento-card')); });
  bentoEl.addEventListener('pointerleave', function () { wake(null); });
  bentoEl.addEventListener('focusin', function (e) { wake(e.target.closest('.bento-card')); });
  bentoEl.addEventListener('focusout', function (e) { if (!bentoEl.contains(e.relatedTarget)) wake(null); });
  /* The cursor steers each schematic: the tangent point and the ball slide along their curve,
     the wave shifts phase and the solid turns. Leaving the card hands it back to the animation. */
  var steerCard = null;
  function steer(fx, u, v) {
    var kind = fx.getAttribute('data-fx');
    if (kind === 'cube') { $('.cube', fx).style.transform = 'rotateX(' + (-8 - v * 40).toFixed(1) + 'deg) rotateY(' + (u * 220 - 80).toFixed(1) + 'deg)'; return; }
    if (kind === 'sine') { $('.fx-wave', fx).setAttribute('transform', 'translate(' + (-u * 40).toFixed(1) + ' 0)'); return; }
    var path = $('.fx-path', fx), mover = $('.fx-steer', fx);
    if (!path || !mover || !path.getTotalLength) return;
    var len = path.getTotalLength(), l = len * (0.06 + 0.88 * u);
    var p = path.getPointAtLength(l), q = path.getPointAtLength(Math.min(len, l + 1));
    var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
    mover.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
  }
  function unsteer() {
    if (!steerCard) return;
    steerCard.classList.remove('is-steer');
    var cube = $('.cube', steerCard);
    if (cube) cube.style.transform = '';
    setLive(steerCard, steerCard.classList.contains('is-live'));   // resume only if it was running
    steerCard = null;
  }
  bentoEl.addEventListener('pointermove', function (e) {
    var c = e.target.closest('.bento-card');
    if (e.pointerType === 'touch') return;
    if (c !== steerCard) unsteer();
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    var fx = $('[data-fx]', c), media = $('.bento-media', c);
    if (!fx || !media) return;
    var m = media.getBoundingClientRect();
    if (steerCard !== c) {
      steerCard = c;
      c.classList.add('is-steer');
      $$('svg.fx-svg', c).forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
    }
    steer(fx, clamp01((e.clientX - m.left) / m.width), clamp01((e.clientY - m.top) / m.height));
  });
  bentoEl.addEventListener('pointerleave', unsteer);
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* ---------- Study Workbench (slide-over) ---------- */
  var wb = $('#workbench');
  var wbPanel = $('.wb-panel', wb);
  var wbTabsEl = $('#wb-tabs');
  var wbTabs = $$('.wb-tab', wb);
  var wbTabpanel = $('#wb-tabpanel');
  var wbTopic = null, wbOpener = null, wbTimer = 0;
  var KIND = {
    notes: { label: 'Concept Notes', link: 'Open notes on Drive' },
    pdf: { label: 'Worked Examples', link: 'Open PDF on Drive' },
    worksheet: { label: 'Practice Worksheets', link: 'Open worksheet on Drive' }
  };

  function wbOpen() { return !wb.hidden && wb.classList.contains('is-open'); }

  function setWbTab(kind, focus) {
    wbTabsEl.setAttribute('data-kind', kind);
    wbTabs.forEach(function (b) {
      var on = b.getAttribute('data-kind') === kind;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on) { wbTabpanel.setAttribute('aria-labelledby', b.id); if (focus) b.focus(); }
    });
    var items = wbTopic.items.filter(function (d) { return d.resources.indexOf(kind) >= 0; });
    wbTabpanel.innerHTML = '<ol class="wb-list">' + items.map(function (d, i) {
      return '<li class="wb-item"><span class="wb-item-n" aria-hidden="true">' + pad(i + 1) + '</span><div>' +
        '<h3 class="wb-item-title">' + esc(d.title) + '</h3>' +
        '<p class="wb-item-text">' + esc(d.summary) + '</p>' +
        '<a class="wb-link" href="' + esc(d.drive || CFG.driveRoot) + '" target="_blank" rel="noopener noreferrer">' +
          icon(RES[kind].icon) + KIND[kind].link + icon('external', 'icon-sm') + SR_NEW_TAB + '</a>' +
      '</div></li>';
    }).join('') + '</ol>';
    wbTabpanel.scrollTop = 0;
  }

  function openWorkbench(t, opener) {
    if (!t) return;
    clearTimeout(wbTimer);
    wbTopic = t;
    wbOpener = opener || null;
    var n = t.items.length;
    $('#wb-meta').innerHTML = '<span>Grade ' + t.grade + '</span><span>' + esc(SUBJECT_LABEL[t.subject]) + '</span><span>' + pad(n) + (n === 1 ? ' folder' : ' folders') + '</span>';
    $('#wb-title').textContent = t.topic;
    wb.setAttribute('data-subject', t.subject);

    var pls = playlistsFor(t);
    $('#wb-overview').innerHTML =
      '<p class="wb-ov-k">Overview</p>' +
      '<p class="wb-ov-tele"><span><b>' + pad(n) + '</b> folders</span>' +
        ['notes', 'pdf', 'worksheet'].map(function (k) { return '<span><b>' + pad(resCount(t, k)) + '</b> ' + RES[k].label + '</span>'; }).join('') +
        '<span><b>' + pad(pls.length) + '</b> ' + (pls.length === 1 ? 'playlist' : 'playlists') + '</span></p>' +
      '<ol class="wb-ov-list">' + t.items.map(function (d, i) {
        return '<li><span class="wb-ov-n">' + pad(i + 1) + '</span><span><b>' + esc(d.title) + '</b> ' + esc(d.summary) + '</span></li>';
      }).join('') + '</ol>';
    $('#wb-video').innerHTML =
      '<div class="wb-stage">' + fxFor(t) +
        (pls[0] ? '<a class="wb-play" href="' + esc(pls[0].url) + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="wb-play-btn">' + icon('play', 'icon-lg') + '</span>' +
          '<span class="wb-play-text"><span class="wb-play-k">Watch on YouTube</span><span class="wb-play-t">' + esc(pls[0].title) + '</span></span>' + SR_NEW_TAB + '</a>' : '') +
      '</div>' +
      (pls.length > 1 ? '<ul class="wb-pls">' + pls.slice(1).map(function (p) {
        return '<li><a class="pl-btn" data-subject="' + p.subject + '" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' +
          icon('play', 'icon-md') + '<span class="pl-name">' + esc(p.title) + '</span>' + icon('external', 'icon-sm') + SR_NEW_TAB + '</a></li>';
      }).join('') + '</ul>' : '') +
      '<a class="pl-all" href="' + esc(CFG.playlistsUrl) + '" target="_blank" rel="noopener noreferrer">See every playlist on YouTube ' + icon('external', 'icon-sm') + SR_NEW_TAB + '</a>';
    var stageSvg = $('svg.fx-svg', wb);
    if (stageSvg && stageSvg.pauseAnimations && reduceMotion) stageSvg.pauseAnimations();
    $('.wb-stage', wb).classList.toggle('is-live', !reduceMotion);

    var fs = FORMULAS[t.grade + '/' + t.topic] || [];
    $('#wb-formulas').hidden = !fs.length;
    $('#wb-formula-list').innerHTML = fs.map(function (f, i) {
      return '<details class="wb-acc-item"' + (i === 0 ? ' open' : '') + '><summary>' +
        '<span class="wb-acc-n">' + pad(i + 1) + '</span><code class="wb-f">' + esc(f[0]) + '</code>' +
        icon('chevron', 'icon-sm wb-acc-chev') + '</summary><p class="wb-f-note">' + esc(f[1]) + '</p></details>';
    }).join('');

    var first = null;
    wbTabs.forEach(function (b) {
      var k = b.getAttribute('data-kind'), c = resCount(t, k);
      b.disabled = !c;
      b.innerHTML = '<span>' + KIND[k].label + '</span><span class="wb-tab-n">' + c + '</span>';
      if (c && !first) first = k;
    });
    setWbTab(first || 'notes', false);

    var wasOpen = wbOpen();
    wb.hidden = false;
    document.documentElement.classList.add('wb-lock');
    if (!wasOpen) {
      void wb.offsetWidth; // start the slide from off-screen
      wb.classList.add('is-open');
    }
    $('#wb-title').focus({ preventScroll: true });
  }

  function closeWorkbench(restoreFocus) {
    if (wb.hidden) return;
    wb.classList.remove('is-open');
    document.documentElement.classList.remove('wb-lock');
    wbTimer = setTimeout(function () { wb.hidden = true; }, reduceMotion ? 0 : 360);
    if (/[?&]topic=/.test(location.hash)) {
      // drop the topic from the address so a reload does not reopen it
      history.replaceState(null, '', location.hash.replace(/([?&])topic=[^&]*&?/, '$1').replace(/[?&]$/, ''));
    }
    if (restoreFocus !== false && wbOpener && document.contains(wbOpener)) wbOpener.focus({ preventScroll: true });
  }

  wb.addEventListener('click', function (e) {
    if (e.target.closest('[data-wb-close]')) closeWorkbench();
  });
  wbTabs.forEach(function (b, i) {
    b.addEventListener('click', function () { if (!b.disabled) setWbTab(b.getAttribute('data-kind'), false); });
    b.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      for (var j = 1; j <= wbTabs.length; j++) {
        var nb = wbTabs[(i + dir * j + wbTabs.length * j) % wbTabs.length];
        if (!nb.disabled) { setWbTab(nb.getAttribute('data-kind'), true); break; }
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (!wbOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); closeWorkbench(); return; }
    if (e.key !== 'Tab') return;
    // keep focus inside the dialog
    var f = $$('a[href], button:not([disabled]), summary, [tabindex="0"]', wbPanel)
      .filter(function (el) { return el.tabIndex >= 0 && el.getClientRects().length; });
    if (!f.length) return;
    var idx = f.indexOf(document.activeElement);
    if (e.shiftKey && idx <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (idx === f.length - 1 || !wbPanel.contains(document.activeElement))) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- Team ---------- */
  function avatar(i, tone) {
    // A small generated figure: a bracketed shape that differs per person.
    var shapes = [
      '<path d="M12 4l7 4v8l-7 4-7-4V8z"/>',
      '<circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14"/>',
      '<path d="M4 18 12 5l8 13z"/>',
      '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="m5 5 14 14"/>',
      '<path d="M5 18c3-12 11-12 14 0"/><path d="M5 18h14"/>',
      '<path d="M12 4l3 6 6 .9-4.4 4.2 1 6.1L12 18.4 6.4 21.2l1-6.1L3 10.9 9 10z"/>'
    ];
    return '<span class="avatar avatar-' + tone + '" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24">' + shapes[i % shapes.length] + '</svg></span>';
  }

  function personCard(p, i, big) {
    return '' +
      '<article class="person glass' + (big ? ' person-big' : '') + '" data-tone="' + p.tone + '">' +
        '<div class="person-head">' + avatar(i, p.tone) +
          '<div><p class="person-role">' + esc(p.role) + '</p><h3 class="font-display">' + esc(p.name) + '</h3></div></div>' +
        (p.bio ? '<p class="person-bio">' + esc(p.bio) + '</p>' : '') +
        '<ul class="person-links">' +
          '<li><a href="' + esc(telHref(p.phone)) + '">' + icon('phone') + esc(p.phone) + '</a></li>' +
          (p.email ? '<li><a href="mailto:' + esc(p.email) + '">' + icon('mail') + esc(p.email) + '</a></li>' : '') +
        '</ul>' +
        '<a class="btn btn-ghost btn-sm" href="' + esc(waHref(p.whatsapp, 'Hi ' + p.name + ', I found you on the ' + BRAND + ' website.')) + '" target="_blank" rel="noopener noreferrer">' +
          icon('whatsapp') + 'Message on WhatsApp<span class="sr-only"> (opens in a new tab)</span></a>' +
      '</article>';
  }

  function renderTeam() {
    var groups = [];
    CFG.team.forEach(function (p, i) {
      var g = groups.filter(function (x) { return x.name === p.group; })[0];
      if (!g) { g = { name: p.group, people: [] }; groups.push(g); }
      g.people.push({ p: p, i: i });
    });
    $('#team-groups').innerHTML = groups.map(function (g, gi) {
      return '<section aria-labelledby="tg-' + gi + '">' +
        '<h2 id="tg-' + gi + '" class="block-title font-display">' + esc(g.name) + '</h2>' +
        '<div class="grid gap-5 ' + (gi === 0 ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-2') + '">' +
        g.people.map(function (x) { return personCard(x.p, x.i, gi === 0); }).join('') +
        '</div></section>';
    }).join('');
  }

  /* ---------- Contact ---------- */
  function renderContact() {
    $('#social-grid').innerHTML = CFG.socials.map(function (s) {
      return '<a class="social glass" data-social="' + s.id + '" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="social-icon">' + icon(s.id, 'icon-lg') + '</span>' +
        '<span class="social-body"><span class="social-name font-display">' + esc(s.label) + '</span>' +
        '<span class="social-handle">' + esc(s.handle) + '</span>' +
        '<span class="social-blurb">' + esc(s.blurb) + '</span></span>' +
        '<span class="social-go">' + esc(s.cta) + icon('external', 'icon-sm') + '</span>' +
        '<span class="sr-only">(opens in a new tab)</span></a>';
    }).join('');

    $('#contact-cards').innerHTML = CFG.contacts.map(function (c) {
      return '<article class="person glass">' +
        '<p class="person-role">' + esc(c.role) + '</p>' +
        '<h3 class="font-display">' + esc(c.name) + '</h3>' +
        '<ul class="person-links mt-3">' +
          '<li><a href="' + esc(telHref(c.phone)) + '">' + icon('phone') + esc(c.phone) + '</a></li>' +
          (c.email ? '<li><a href="mailto:' + esc(c.email) + '">' + icon('mail') + esc(c.email) + '</a></li>' : '') +
        '</ul>' +
        '<a class="btn btn-whatsapp btn-sm mt-4" href="' + esc(waHref(c.whatsapp, c.message)) + '" target="_blank" rel="noopener noreferrer">' +
          icon('whatsapp') + 'Message on WhatsApp<span class="sr-only"> (opens in a new tab)</span></a>' +
      '</article>';
    }).join('');
  }

  /* ---------- YouTube stats ---------- */
  var YT = CFG.youtube;
  var ytEl = $('#yt-stats');
  var ytCounts = $$('.count', ytEl);
  var nf = new Intl.NumberFormat('en-US');
  var ytData = { subscribers: YT.snapshot.subscribers, views: YT.snapshot.views };
  var ytLive = false;
  var ytShown = false; // true once the counters have animated for the current visit

  $('#yt-subscribe').href = YT.subscribeUrl;

  function ytLabel(v) { return typeof v === 'number' ? nf.format(v) : '–'; }

  function renderYtMeta() {
    $('#yt-badge-text').textContent = ytLive ? 'Live channel stats' : 'Channel stats';
    ytEl.classList.toggle('is-live', ytLive);
    var asOf = $('#yt-asof');
    if (ytLive) { asOf.textContent = 'Updated just now from YouTube.'; return; }
    var d = new Date(YT.snapshot.asOf + 'T00:00:00');
    asOf.textContent = isNaN(d) ? '' : 'As of ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
  }

  function animateCount(el, to) {
    cancelAnimationFrame(el._raf);
    if (typeof to !== 'number') { el.textContent = ytLabel(to); return; }
    if (reduceMotion || to < 1) { el.textContent = ytLabel(to); return; }
    var from = 0, ms = 1600, t0 = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - t0) / ms);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = nf.format(Math.round(from + (to - from) * eased));
      if (p < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }

  function runCounters() {
    ytShown = true;
    ytCounts.forEach(function (el) { animateCount(el, ytData[el.getAttribute('data-key')]); });
  }
  function resetCounters() {
    ytShown = false;
    ytCounts.forEach(function (el) { cancelAnimationFrame(el._raf); el.textContent = '0'; });
  }
  function syncYtFinal() {
    $$('[data-final]', ytEl).forEach(function (el) { el.textContent = ytLabel(ytData[el.getAttribute('data-final')]); });
  }

  function loadLiveYtStats() {
    if (!YT.apiKey) return;
    var url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + encodeURIComponent(YT.channelId) +
      '&key=' + encodeURIComponent(YT.apiKey);
    fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (json) {
      var s = json.items && json.items[0] && json.items[0].statistics;
      if (!s) throw new Error('no statistics');
      ytData = {
        subscribers: s.hiddenSubscriberCount ? null : Number(s.subscriberCount),
        views: Number(s.viewCount)
      };
      ytLive = true;
      renderYtMeta();
      syncYtFinal();
      if (ytShown) runCounters();
    }).catch(function () { /* keep the dated snapshot */ });
  }

  renderYtMeta();
  syncYtFinal();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { if (!ytShown) runCounters(); }
      else resetCounters();
    }, { threshold: 0.4 }).observe(ytEl);
  } else {
    runCounters();
  }
  loadLiveYtStats();

  /* ---------- Contact form ---------- */
  var form = $('#contact-form');
  var statusEl = $('#form-status');
  var submitBtn = $('#form-submit');

  var RULES = {
    name: function (v) { return v.trim() ? '' : 'Enter your name.'; },
    grade: function (v) { return v ? '' : 'Choose your grade.'; },
    email: function (v) {
      if (!v.trim()) return 'Enter your email so we can reply.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter an email like name@example.com.';
    },
    topic: function (v) { return v ? '' : 'Choose what this is about.'; },
    message: function (v) {
      var n = v.trim().length;
      return n >= 10 ? '' : (n === 0 ? 'Write a short message.' : 'Add a little more detail (at least 10 characters).');
    }
  };

  function setError(field, msg) {
    var input = form.elements[field];
    var err = $('#e-' + (field === 'message' ? 'message' : field));
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      err.textContent = msg;
      err.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      err.hidden = true;
      err.textContent = '';
    }
    return !msg;
  }
  function validateField(field) { return setError(field, RULES[field](form.elements[field].value)); }

  Object.keys(RULES).forEach(function (field) {
    var el = form.elements[field];
    el.addEventListener('blur', function () { if (el.value || el.hasAttribute('aria-invalid')) validateField(field); });
    el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid')) validateField(field); });
  });

  function showStatus(kind, text) {
    statusEl.hidden = false;
    statusEl.className = 'form-status form-status-' + kind;
    statusEl.innerHTML = icon(kind === 'ok' ? 'check' : 'alert') + '<span>' + esc(text) + '</span>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.hidden = true;
    var firstBad = null;
    Object.keys(RULES).forEach(function (field) {
      if (!validateField(field) && !firstBad) firstBad = form.elements[field];
    });
    if (firstBad) { firstBad.focus(); showStatus('error', 'Fix the highlighted fields and send again.'); return; }

    var payload = {};
    Object.keys(RULES).forEach(function (f) { payload[f] = form.elements[f].value.trim(); });

    if (CFG.form.endpoint) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      fetch(CFG.form.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        showStatus('ok', 'Message sent. A club member will reply by email.');
      }).catch(function () {
        showStatus('error', 'The message did not send. Check your connection and try again, or email ' + CFG.club.email + '.');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      });
      return;
    }

    var subject = payload.topic + ' (' + payload.grade + ')';

    if (CFG.form.method === 'email') {
      var body = payload.message + '\n\n' + payload.name + '\n' + payload.grade + '\n' + payload.email;
      window.location.href = 'mailto:' + encodeURIComponent(CFG.form.recipient).replace('%40', '@') +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      showStatus('ok', 'Your email app should open with this message ready to send. If it does not, write to ' + CFG.form.recipient + '.');
      return;
    }

    // Default: open WhatsApp with the message written out, ready for the visitor to send.
    var text = 'New message from the ' + BRAND + ' website\n' +
      'Topic: ' + payload.topic + '\n' +
      'Name: ' + payload.name + '\n' +
      'Grade: ' + payload.grade + '\n' +
      'Email: ' + payload.email + '\n\n' + payload.message;
    var win = window.open(waHref(CFG.form.whatsappTo, text), '_blank');
    if (win) {
      win.opener = null;
      form.reset();
      showStatus('ok', 'WhatsApp is opening with your message ready. Press send there to deliver it to the club.');
    } else {
      showStatus('error', 'Your browser blocked WhatsApp from opening. Allow pop-ups for this site and send again, or message the club directly on WhatsApp.');
    }
  });

  /* ---------- boot ---------- */
  $('#year').textContent = new Date().getFullYear();
  renderTeam();
  renderContact();
  syncStudyUI();
  window.addEventListener('hashchange', route);
  route();
})();
