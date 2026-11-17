/*
 * Home page motion and the subjects accordion.
 * Hero: scrolling down raises the ramp angle, slides the block, and resolves the weight F into its
 * components along (Fx = F sin theta) and across (Fy = F cos theta) the slope. GSAP ScrollTrigger ties it
 * to scroll position; with reduced motion, or without GSAP, the resolved frame is drawn once.
 * About: the paragraph lights up word by word as it scrolls through.
 * Subjects: one vertical slice per topic that widens on hover or focus.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var DATA = window.MATHRIX_STUDY || [];
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- hero plane ---------- */
  var cv = document.getElementById('hp-canvas'), hero = document.getElementById('hero');
  var state = { p: reduceMotion ? 1 : 0 };

  function arrow(ctx, x0, y0, x1, y1, color, label, dashed) {
    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 3) return;
    var ux = dx / len, uy = dy / len;
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - ux * 10 - uy * 5, y1 - uy * 10 + ux * 5); ctx.lineTo(x1 - ux * 10 + uy * 5, y1 - uy * 10 - ux * 5);
    ctx.closePath(); ctx.fill();
    if (label) { ctx.font = '12px "JetBrains Mono", monospace'; ctx.fillText(label, x1 + 8, y1 + 4); }
    ctx.restore();
  }

  function draw() {
    if (!cv || !cv.clientWidth) return;
    var w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var p = state.p, ink = css('--text'), mut = css('--text-3');
    var th = (8 + 24 * p) * Math.PI / 180;                       // 8 deg to 32 deg
    var y0 = h - 28, x0 = w * 0.06;
    var R = Math.min(w * 0.88, (h * 0.36) / Math.sin(th));     // the ramp never climbs into the headline
    var T = { x: x0, y: y0 - R * Math.sin(th) }, P = { x: x0 + R * Math.cos(th), y: y0 };
    var d = { x: Math.cos(th), y: Math.sin(th) }, n = { x: Math.sin(th), y: -Math.cos(th) };

    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y0 + 0.5); ctx.lineTo(w, y0 + 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(T.x, T.y); ctx.lineTo(P.x, P.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(P.x, P.y, 44, Math.PI, Math.PI + th); ctx.stroke();
    ctx.fillStyle = ink; ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('θ = ' + (th * 180 / Math.PI).toFixed(1) + '°', P.x - 130, P.y - 12);

    var b = Math.max(26, Math.min(w, h) * 0.05), s = R * (0.2 + 0.45 * p);
    var C = { x: T.x + d.x * s + n.x * b / 2, y: T.y + d.y * s + n.y * b / 2 };
    ctx.save(); ctx.translate(C.x, C.y); ctx.rotate(th);
    ctx.fillStyle = css('--surface'); ctx.fillRect(-b / 2, -b / 2, b, b);
    ctx.strokeStyle = ink; ctx.strokeRect(-b / 2, -b / 2, b, b);
    ctx.restore();

    // F resolves: the components grow out of the weight as p rises
    var L = Math.min(h * 0.2, 150), q = Math.max(0, Math.min(1, (p - 0.1) / 0.6));
    var F = { x: C.x, y: C.y + L };
    var Fx = { x: C.x + d.x * L * Math.sin(th) * q, y: C.y + d.y * L * Math.sin(th) * q };
    var Fy = { x: C.x - n.x * L * Math.cos(th) * q, y: C.y - n.y * L * Math.cos(th) * q };
    if (q > 0.02) {
      ctx.save(); ctx.strokeStyle = mut; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(F.x, F.y); ctx.lineTo(Fx.x, Fx.y); ctx.moveTo(F.x, F.y); ctx.lineTo(Fy.x, Fy.y); ctx.stroke();
      ctx.restore();
      arrow(ctx, C.x, C.y, Fx.x, Fx.y, css('--mech'), 'Fx = F sinθ');
      arrow(ctx, C.x, C.y, Fy.x, Fy.y, css('--math'), 'Fy = F cosθ');
    }
    arrow(ctx, C.x, C.y, F.x, F.y, ink, 'F');
  }

  if (cv && hero) {
    window.addEventListener('resize', draw);
    document.addEventListener('mathrix:theme', draw);
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(cv);
    if (gsap && ST && !reduceMotion) {
      gsap.registerPlugin(ST);
      gsap.to(state, {
        p: 1, ease: 'none', onUpdate: draw,
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    }
    draw();
  }

  /* ---------- About: word-by-word reveal ---------- */
  var about = document.querySelector('.about-text');
  if (about && gsap && ST && !reduceMotion) {
    about.innerHTML = about.textContent.split(/(\s+)/).map(function (wd) {
      return /^\s+$/.test(wd) ? wd : '<span class="scrub-word">' + esc(wd) + '</span>';
    }).join('');
    gsap.fromTo(about.querySelectorAll('.scrub-word'), { opacity: 0.15 }, {
      opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: about, start: 'top 85%', end: 'bottom 50%', scrub: true }
    });
  }

  /* ---------- Subjects: horizontal accordion, one slice per topic ---------- */
  var hacc = document.getElementById('hacc');
  if (hacc) {
    var topics = [];
    DATA.forEach(function (d) {
      var t = topics.filter(function (x) { return x.topic === d.topic && x.subject === d.subject; })[0];
      if (!t) { t = { topic: d.topic, subject: d.subject, los: [] }; topics.push(t); }
      t.los.push(d);
    });
    // LO numbers match the Study Hub: position of the folder within its grade
    function loNum(d) { return DATA.filter(function (x) { return x.grade === d.grade; }).indexOf(d) + 1; }
    hacc.innerHTML = topics.map(function (t, i) {
      return '<div class="hacc-slice' + (i === 0 ? ' is-open' : '') + '" role="listitem" data-subject="' + t.subject + '">' +
        '<p class="hacc-label"><span>' + (t.subject === 'math' ? 'Math' : 'Mechanics') + '</span> ' + esc(t.topic) + '</p>' +
        '<div class="hacc-body"><ul>' + t.los.map(function (d) {
          return '<li><b>G' + d.grade + ' LO' + loNum(d) + '</b> ' + esc(d.title) + '</li>';
        }).join('') + '</ul>' +
        '<a class="interactive-hover-btn" href="#/study?subject=' + t.subject + '&amp;q=' + encodeURIComponent(t.topic) + '">Study ' + esc(t.topic) + '</a></div></div>';
    }).join('');
    function openSlice(el) {
      if (!el) return;
      Array.prototype.forEach.call(hacc.children, function (c) { c.classList.toggle('is-open', c === el); });
    }
    hacc.addEventListener('pointerover', function (e) { openSlice(e.target.closest('.hacc-slice')); });
    hacc.addEventListener('focusin', function (e) { openSlice(e.target.closest('.hacc-slice')); });
  }

  // views start hidden; recompute trigger positions after each route change
  if (ST) window.addEventListener('hashchange', function () { setTimeout(function () { ST.refresh(); draw(); }, 60); });
})();
