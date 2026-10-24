/*
 * Home page showcase, in plain JavaScript:
 *  1. Scroll-tilt preview: a "screen" that starts tipped back and flattens as you scroll to it,
 *     showing the Grade 10 topic folders (each one opens its Study Workbench).
 *  2. Features bento: three live diagrams. Questions flowing through the club into worksheets,
 *     the club's channels hub, and a projectile trajectory you can scrub.
 * Everything animates only while on screen, and stays still under prefers-reduced-motion.
 */
(function () {
  'use strict';

  var CFG = window.MATHRIX_CONFIG;
  var DATA = window.MATHRIX_STUDY || [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BRAND = window.SITE_BRAND_NAME || 'MATHRIX';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function onScreen(el, cb, threshold) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { threshold: threshold || 0 }).observe(el);
  }
  function pauseSvg(svg, run) {
    if (!svg || !svg.pauseAnimations) return;
    if (run && !reduceMotion) svg.unpauseAnimations(); else svg.pauseAnimations();
  }
  var SR_NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';

  /* ================= 1. Scroll-tilt preview ================= */
  var cs = $('#cs');
  if (cs) {
    var csCard = $('#cs-card');
    var topics = [];
    DATA.forEach(function (d) {
      if (d.grade !== '10') return;
      var t = topics.filter(function (x) { return x.subject === d.subject && x.topic === d.topic; })[0];
      if (!t) { t = { subject: d.subject, topic: d.topic, n: 0 }; topics.push(t); }
      t.n++;
    });
    $('#cs-grid').innerHTML = topics.map(function (t) {
      return '<li><a class="cs-tile" data-subject="' + t.subject + '" href="#/study?grade=10&amp;subject=' + t.subject + '&amp;topic=' + encodeURIComponent(t.topic) + '">' +
        '<span class="cs-tile-k">' + (t.subject === 'math' ? 'Math' : 'Mechanics') + '</span>' +
        '<span class="cs-tile-t">' + esc(t.topic) + '</span>' +
        '<span class="cs-tile-n">' + t.n + (t.n === 1 ? ' folder' : ' folders') + '</span></a></li>';
    }).join('');

    var mobile = window.matchMedia('(max-width: 768px)');
    var csTick = 0;
    var setTilt = function (p) {
      var s0 = mobile.matches ? 0.7 : 1.05, s1 = mobile.matches ? 0.9 : 1;
      cs.style.setProperty('--cs-rot', (20 * (1 - p)).toFixed(2) + 'deg');
      cs.style.setProperty('--cs-scale', (s0 + (s1 - s0) * p).toFixed(4));
      cs.style.setProperty('--cs-y', (-100 * p).toFixed(1) + 'px');
    };
    var csUpdate = function () {
      csTick = 0;
      // 0 when the section enters at the bottom, 1 when the screen's middle reaches the middle of the viewport
      var vh = window.innerHeight, r = cs.getBoundingClientRect();
      var mid = csCard.offsetTop + csCard.offsetHeight / 2;
      setTilt(clamp((vh - r.top) / (mid + vh / 2), 0, 1));
    };
    var csQueue = function () { if (!csTick) csTick = requestAnimationFrame(csUpdate); };
    if (reduceMotion) setTilt(1);
    else {
      var csLive = false;
      onScreen(cs, function (v) {
        if (v === csLive) return;
        csLive = v;
        if (v) { window.addEventListener('scroll', csQueue, { passive: true }); window.addEventListener('resize', csQueue); csQueue(); }
        else { window.removeEventListener('scroll', csQueue); window.removeEventListener('resize', csQueue); }
      });
      setTilt(0);
    }
  }

  /* ================= 2. Features bento ================= */
  var ib = $('#ib-bento');
  if (!ib) return;

  function brackets() {
    return '<span class="ib-c ib-c-tl" aria-hidden="true"></span><span class="ib-c ib-c-tr" aria-hidden="true"></span>' +
      '<span class="ib-c ib-c-bl" aria-hidden="true"></span><span class="ib-c ib-c-br" aria-hidden="true"></span>';
  }

  /* --- Flow: questions in, through the club hub, worksheets out --- */
  var QUESTIONS = [
    { x: 58, y: 38, g: '10', label: 'G10 · Quadratics' },
    { x: 104, y: 22, g: '11', label: 'G11 · Projectile motion' },
    { x: 150, y: 40, g: '10', label: 'G10 · Free-body diagrams' },
    { x: 46, y: 92, g: '11', label: 'G11 · Derivatives' },
    { x: 146, y: 114, g: '10', label: 'G10 · Circle theorems' }
  ];
  var L1 = 'M117,67 C196,67 210,100 262,100', L2 = 'M117,73 C186,73 206,120 262,120';
  var R1 = 'M378,100 C412,100 418,86 450,86', R2 = 'M378,120 C412,120 418,134 450,134';
  var SHEETS = DATA.map(function (d) { return 'G' + d.grade + ' · ' + d.topic.toUpperCase(); })
    .filter(function (s, i, a) { return a.indexOf(s) === i; });

  function rays() {
    var out = '';
    [-62, -38, -14, 14, 38, 62].forEach(function (a) {
      var r = Math.PI / 180;
      out += '<path d="M320,110 L' + (320 + Math.sin(a * r) * 260).toFixed(1) + ',' + (110 - Math.cos(a * r) * 260).toFixed(1) +
        ' L' + (320 + Math.sin((a + 7) * r) * 260).toFixed(1) + ',' + (110 - Math.cos((a + 7) * r) * 260).toFixed(1) + 'Z" fill="url(#ib-rays)" opacity=".5"/>';
    });
    return out;
  }
  function sheetStack(k0) {
    var out = '';
    [2, 1, 0].forEach(function (k) {
      var name = SHEETS[(k0 - k + SHEETS.length * 4) % SHEETS.length] || 'WORKSHEET';
      out += '<g transform="translate(' + (450 + k * 12) + ',' + (40 - k * 10) + ')" opacity="' + (1 - k * 0.25) + '">' +
        '<g class="ib-sheet' + (k === 0 ? ' ib-sheet-new' : '') + '">' +
        '<rect width="138" height="102" rx="4" class="ib-paper-rect"/>';
      if (k === 0) {
        out += '<text x="10" y="16" class="ib-t-mono">WORKSHEET</text>' +
          '<text x="10" y="30" class="ib-t-strong">' + esc(name) + '</text>' +
          '<rect x="10" y="38" width="92" height="3" rx="1" class="ib-bar"/><rect x="10" y="44" width="80" height="3" rx="1" class="ib-bar"/>' +
          '<path d="M12 90 Q38 52 64 90" class="ib-mini-arc"/>' +
          '<path d="M80 62h44M80 70h36M80 78h40M80 86h28" class="ib-lines"/>';
      }
      out += '</g></g>';
    });
    return out;
  }
  function flowCard() {
    var nodes = QUESTIONS.map(function (q) {
      return '<line x1="' + q.x + '" y1="' + q.y + '" x2="104" y2="70" class="ib-spoke"/>';
    }).join('') +
      '<g transform="translate(91,57)"><rect width="26" height="26" rx="6" class="ib-node"/><text x="13" y="17.5" text-anchor="middle" class="ib-t-strong">?</text></g>' +
      QUESTIONS.map(function (q) {
        var w = q.label.length * 4.9 + 12;
        return '<g class="ib-q" tabindex="0" role="img" aria-label="Question about ' + esc(q.label.replace('·', '')) + '">' +
          '<circle cx="' + q.x + '" cy="' + q.y + '" r="11" class="ib-q-dot" data-g="' + q.g + '"/>' +
          '<text x="' + q.x + '" y="' + (q.y + 3) + '" text-anchor="middle" class="ib-t-q">' + q.g + '</text>' +
          '<g class="ib-tip" transform="translate(' + q.x + ',' + (q.y - 18) + ')"><rect x="' + (-w / 2) + '" y="-9" width="' + w + '" height="14" rx="3"/>' +
          '<text x="0" y="1" text-anchor="middle">' + esc(q.label) + '</text></g></g>';
      }).join('');
    var pkts = reduceMotion ? '' : [L1, L2, R1, R2].map(function (d, i) {
      return '<circle r="2.2" class="ib-pkt"><animateMotion dur="' + (2.2 + (i % 2) * 0.6) + 's" begin="' + (i * 0.35) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    }).join('');
    return '<div class="ib-frame ib-wide">' + brackets() + '<div class="ib-card ib-card-flow">' +
      '<svg class="ib-diagram" id="ib-flow" viewBox="0 0 640 178" role="img" aria-label="Questions about Grade 10 and 11 topics flow through ' + esc(BRAND) + ' and come out as worksheets">' +
        '<defs><radialGradient id="ib-glow" cx="320" cy="110" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:var(--surface-2)"/><stop offset="1" style="stop-color:var(--surface-2)" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="ib-rays" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:rgb(var(--fg-rgb))" stop-opacity=".1"/><stop offset="1" style="stop-color:rgb(var(--fg-rgb))" stop-opacity="0"/></linearGradient></defs>' +
        '<rect width="640" height="178" fill="url(#ib-glow)"/>' + rays() +
        '<g class="ib-side" data-side="left"><rect x="20" y="8" width="170" height="130" fill="transparent"/>' + nodes + '</g>' +
        '<path d="' + L1 + '" class="ib-flow ib-flow-l"/><path d="' + L2 + '" class="ib-flow ib-flow-l ib-dash"/>' +
        '<path d="' + R1 + '" class="ib-flow ib-flow-r"/><path d="' + R2 + '" class="ib-flow ib-flow-r ib-dash"/>' + pkts +
        '<g transform="translate(262,88)"><rect x="-4" y="-4" width="124" height="52" rx="9" class="ib-hub-ring' + (reduceMotion ? '' : ' ib-glow') + '"/>' +
          '<rect width="116" height="44" rx="7" class="ib-node"/>' +
          '<image href="logo.png" x="9" y="8" width="28" height="28" class="ib-logo"/>' +
          '<text x="44" y="26" class="ib-t-chip"' + (BRAND.length > 7 ? ' textLength="54" lengthAdjust="spacingAndGlyphs"' : '') + '>' + esc(BRAND.toUpperCase()) + '</text><path d="M102 18l4 4-4 4" class="ib-chev"/></g>' +
        '<g class="ib-side" data-side="right" id="ib-stack">' + sheetStack(0) + '</g>' +
      '</svg>' +
      '<div class="ib-wide-copy">' +
        '<div><h3>Questions in, explanations out</h3><p>Send a question about any Grade 10 or Grade 11 topic. A club member replies and breaks it into clear steps.</p></div>' +
        '<div><h3>Material for every topic</h3><p>Notes, PDFs and worksheets are sorted by grade and topic, so you open exactly the one you need.</p></div>' +
      '</div></div></div>';
  }

  /* --- Hub: the club's real channels --- */
  var social = function (id) { return (CFG.socials || []).filter(function (s) { return s.id === id; })[0]; };
  var CHANNELS = [
    { name: 'Google Drive', short: 'drive', icon: 'folder', url: CFG.driveRoot },
    { name: 'WhatsApp', short: 'whatsapp', icon: 'whatsapp', url: (social('whatsapp') || {}).url },
    { name: 'YouTube', short: 'youtube', icon: 'youtube', url: CFG.youtube && CFG.youtube.subscribeUrl },
    { name: 'Instagram', short: 'instagram', icon: 'instagram', url: (social('instagram') || {}).url }
  ].filter(function (c) { return c.url; });
  var TILES = [{ x: 66, y: 34 }, { x: 66, y: 116 }, { x: 234, y: 34 }, { x: 234, y: 116 }];
  function hubPath(i) {
    var t = TILES[i], dir = t.x < 150 ? -1 : 1;
    return 'M' + (150 + dir * 17) + ',75 H' + (150 + dir * 42) + ' V' + t.y + ' H' + (t.x - dir * 15);
  }
  function hubCard() {
    var paths = CHANNELS.map(function (c, i) { return '<path d="' + hubPath(i) + '" class="ib-flow" data-i="' + i + '"/>'; }).join('');
    var tiles = CHANNELS.map(function (c, i) {
      var t = TILES[i];
      return '<a class="ib-tool" data-i="' + i + '" href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(c.name) + ' (opens in a new tab)">' +
        '<rect x="' + (t.x - 15) + '" y="' + (t.y - 15) + '" width="30" height="30" rx="7" class="ib-node"/>' +
        '<use href="#i-' + c.icon + '" x="' + (t.x - 8) + '" y="' + (t.y - 8) + '" width="16" height="16" class="ib-tool-icon"/>' +
        '<text x="' + t.x + '" y="' + (t.y + (t.y < 75 ? -21 : 28)) + '" text-anchor="middle" class="ib-tool-label">' + esc(c.name) + '</text></a>';
    }).join('');
    return '<div class="ib-frame">' + brackets() + '<div class="ib-card">' +
      '<svg class="ib-diagram" id="ib-hub" viewBox="0 0 300 150" role="group" aria-label="The club\'s channels">' + paths +
        '<circle r="2.2" class="ib-pkt" id="ib-hub-pkt" visibility="hidden"><animateMotion id="ib-hub-motion" dur="1.1s" repeatCount="indefinite" path="' + hubPath(0) + '"/></circle>' +
        '<g transform="translate(133,58)"><rect width="34" height="34" rx="8" class="ib-node"/><image href="logo.png" x="5" y="5" width="24" height="24" class="ib-logo"/></g>' +
        tiles +
        '<text x="150" y="114" text-anchor="middle" class="ib-t-mono" id="ib-hub-status">' + CHANNELS.length + ' channels linked</text>' +
      '</svg>' +
      '<div class="ib-copy"><h3>Every channel in one place</h3><p>The Drive folder, the WhatsApp group, our YouTube playlists and Instagram, each one tap away.</p></div>' +
      '</div></div>';
  }

  /* --- Trajectory: y(t) for a 20 m/s launch at 45 degrees --- */
  var V = 20, ANG = 45, G = 9.81, W = 300, H = 130, PAD = 14, N = 13;
  var vy = V * Math.sin(ANG * Math.PI / 180), T = 2 * vy / G, APEX = Math.round((N - 1) / 2);
  var samples = [];
  for (var k = 0; k < N; k++) { var tt = T * k / (N - 1); samples.push({ t: tt, h: Math.max(0, vy * tt - 0.5 * G * tt * tt) }); }
  var hMax = vy * vy / (2 * G);
  var pts = samples.map(function (s, i) { return [PAD + i / (N - 1) * (W - PAD * 2), H - PAD - s.h / hMax * (H - PAD * 2)]; });
  // y(t) is an exact parabola, so one quadratic Bezier draws it: the control point sits at twice the apex height
  var base = H - PAD, apexY = base - (H - PAD * 2);
  var line = 'M' + pts[0][0].toFixed(1) + ',' + base + ' Q' + (W / 2) + ',' + (2 * apexY - base) + ' ' + pts[N - 1][0].toFixed(1) + ',' + base;
  var area = line + ' L' + pts[N - 1][0].toFixed(1) + ',' + (H - PAD) + ' L' + pts[0][0].toFixed(1) + ',' + (H - PAD) + ' Z';
  function readout(i) { return 't ' + samples[i].t.toFixed(2) + ' s · h ' + samples[i].h.toFixed(1) + ' m'; }
  function chartCard() {
    return '<div class="ib-frame" id="ib-chart-frame">' + brackets() + '<div class="ib-card">' +
      '<svg class="ib-diagram ib-chart" id="ib-chart" viewBox="0 0 ' + W + ' ' + (H + 6) + '" tabindex="0" role="slider" aria-label="Ball height over time" ' +
        'aria-valuemin="0" aria-valuemax="' + (N - 1) + '" aria-valuenow="' + APEX + '" aria-valuetext="' + readout(APEX) + '">' +
        '<defs><linearGradient id="ib-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--math)" stop-opacity=".22"/><stop offset="1" style="stop-color:var(--math)" stop-opacity="0"/></linearGradient></defs>' +
        [0.25, 0.5, 0.75].map(function (g) { return '<line x1="' + PAD + '" x2="' + (W - PAD) + '" y1="' + H * g + '" y2="' + H * g + '" class="ib-gridline"/>'; }).join('') +
        '<path d="' + area + '" fill="url(#ib-area)"/>' +
        '<path d="' + line + '" pathLength="1" class="ib-line-draw"/>' +
        '<line x1="' + pts[APEX][0] + '" x2="' + pts[APEX][0] + '" y1="10" y2="' + (H - PAD) + '" class="ib-split"/>' +
        '<text x="' + (pts[APEX][0] + 4) + '" y="' + (H - 18) + '" class="ib-t-mono">APEX ' + hMax.toFixed(1) + ' m</text>' +
        '<line id="ib-cursor" y1="8" y2="' + (H - PAD) + '" class="ib-cursor" visibility="hidden"/>' +
        '<circle id="ib-dot" r="3.4" class="ib-dot"/>' +
        '<g id="ib-tipbox"><rect x="-44" y="-11" width="88" height="15" rx="3" class="ib-tip-rect"/><text id="ib-tiptext" x="0" y="-1" text-anchor="middle" class="ib-tip-text"></text></g>' +
      '</svg>' +
      '<div class="ib-copy"><h3>Scrub a trajectory</h3><p>Move across the curve, or use the arrow keys, to read the height of a ball launched at 20 m/s and 45° with g = 9.81 m/s².</p></div>' +
      '</div></div>';
  }

  ib.innerHTML = flowCard() + hubCard() + chartCard();

  /* --- behaviour --- */
  var section = $('#ib');
  var flowSvg = $('#ib-flow'), hubSvg = $('#ib-hub'), chart = $('#ib-chart');
  var live = false, sheetN = 0, sheetTimer = 0, hubTimer = 0, hubOn = 0, hubHover = -1;

  // hover a side of the flow diagram to light its connectors
  Array.prototype.forEach.call(flowSvg.querySelectorAll('.ib-side'), function (g) {
    var side = g.getAttribute('data-side');
    g.addEventListener('mouseenter', function () { flowSvg.classList.add('ib-on-' + side); });
    g.addEventListener('mouseleave', function () { flowSvg.classList.remove('ib-on-' + side); });
  });

  function setHub(i) {
    hubOn = i;
    Array.prototype.forEach.call(hubSvg.querySelectorAll('[data-i]'), function (el) {
      el.classList.toggle('is-on', +el.getAttribute('data-i') === i);
    });
    var pkt = $('#ib-hub-pkt'), mo = $('#ib-hub-motion');
    if (i < 0 || reduceMotion) { pkt.setAttribute('visibility', 'hidden'); }
    else { mo.setAttribute('path', hubPath(i)); pkt.setAttribute('visibility', 'visible'); }
    $('#ib-hub-status').textContent = i < 0 ? CHANNELS.length + ' channels linked' : 'linked · ' + CHANNELS[i].short;
  }
  Array.prototype.forEach.call(hubSvg.querySelectorAll('.ib-tool'), function (a) {
    var i = +a.getAttribute('data-i');
    var enter = function () { hubHover = i; setHub(i); };
    var leave = function () { hubHover = -1; setHub(reduceMotion ? -1 : hubOn); };
    a.addEventListener('mouseenter', enter); a.addEventListener('focus', enter);
    a.addEventListener('mouseleave', leave); a.addEventListener('blur', leave);
  });
  setHub(reduceMotion ? -1 : 0);

  function setLive(v) {
    live = v && !reduceMotion;
    pauseSvg(flowSvg, live); pauseSvg(hubSvg, live);
    section.classList.toggle('is-live', live);
    clearInterval(sheetTimer); clearInterval(hubTimer);
    if (!live) return;
    sheetTimer = setInterval(function () { sheetN++; $('#ib-stack').innerHTML = sheetStack(sheetN); }, 2800);
    hubTimer = setInterval(function () { if (hubHover < 0) setHub((hubOn + 1) % CHANNELS.length); }, 1700);
  }
  onScreen(section, function (v) {
    if (v) section.classList.add('is-in'); // reveal and draw the curve once
    setLive(v);
  }, 0.12);
  pauseSvg(flowSvg, false); pauseSvg(hubSvg, false);

  // trajectory scrubbing
  var cur = APEX, hovering = false;
  function showPoint(i, cursor) {
    cur = i;
    var p = pts[i];
    $('#ib-dot').setAttribute('cx', p[0]); $('#ib-dot').setAttribute('cy', p[1]);
    var c = $('#ib-cursor');
    c.setAttribute('x1', p[0]); c.setAttribute('x2', p[0]); c.setAttribute('visibility', cursor ? 'visible' : 'hidden');
    $('#ib-tipbox').setAttribute('transform', 'translate(' + clamp(p[0], 48, W - 48) + ',' + (p[1] < 34 ? p[1] + 24 : p[1] - 12) + ')');
    $('#ib-tiptext').textContent = readout(i);
    chart.setAttribute('aria-valuenow', String(i));
    chart.setAttribute('aria-valuetext', readout(i));
  }
  chart.addEventListener('pointermove', function (e) {
    var r = chart.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, best = 0;
    for (var i = 1; i < N; i++) if (Math.abs(pts[i][0] - x) < Math.abs(pts[best][0] - x)) best = i;
    hovering = true;
    showPoint(best, true);
  });
  chart.addEventListener('pointerleave', function () { hovering = false; showPoint(cur, false); });
  chart.addEventListener('keydown', function (e) {
    var i = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') i++;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') i--;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = N - 1;
    else return;
    e.preventDefault();
    showPoint(clamp(i, 0, N - 1), true);
  });
  chart.addEventListener('blur', function () { if (!hovering) showPoint(cur, false); });
  showPoint(APEX, false);
})();
