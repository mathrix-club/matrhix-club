/*
 * Study Hub sandbox.
 * Fig. 1: a block on an inclined plane. Tilt the ramp, change the mass or the friction coefficients,
 * and the force vectors redraw; once mg sin(theta) beats the largest static friction (mu_s N), the block slides.
 * Fig. 2: x(t) = t^3 - 6t^2 + 9t + 2. Pick a time and read v = dx/dt (slope of the tangent) and a = d2x/dt2.
 * Colours come from the theme tokens, so both figures follow the palette switcher.
 */
(function () {
  'use strict';

  var G = 9.81;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id) { return document.getElementById(id); }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function f2(v) { return (Math.abs(v) < 0.005 ? 0 : v).toFixed(2); }

  /* ---------- physics: pure, so it can be checked ---------- */
  function planeState(thetaDeg, m, muS, muK) {
    var th = thetaDeg * Math.PI / 180, W = m * G;
    var along = W * Math.sin(th), N = W * Math.cos(th), fMax = muS * N;
    var sliding = along > fMax + 1e-9;
    var f = sliding ? Math.min(muK, muS) * N : along;
    return { W: W, along: along, N: N, fMax: fMax, f: f, sliding: sliding, a: sliding ? (along - f) / m : 0,
      critical: Math.atan(muS) * 180 / Math.PI };
  }
  function x(t) { return t * t * t - 6 * t * t + 9 * t + 2; }
  function v(t) { return 3 * t * t - 12 * t + 9; }
  function acc(t) { return 6 * t - 12; }

  // self-check: tan 20deg = 0.36 < 0.5 holds, tan 30deg = 0.58 > 0.5 slides; v = 0 at t = 1 and t = 3
  console.assert(!planeState(20, 4, 0.5, 0.3).sliding && planeState(30, 4, 0.5, 0.3).sliding, 'plane threshold');
  console.assert(Math.abs(planeState(30, 2, 0.5, 0.3).a - G * (0.5 - 0.3 * Math.cos(Math.PI / 6))) < 1e-9, 'plane acceleration');
  console.assert(v(1) === 0 && v(3) === 0 && acc(2) === 0, 'calculus');

  /* ---------- canvas helper ---------- */
  function fit(cv, ratio) {
    var w = cv.clientWidth, h = Math.round(w * ratio), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function arrow(ctx, x0, y0, dx, dy, color, label, dashed) {
    var len = Math.hypot(dx, dy);
    if (len < 2) return;
    var ux = dx / len, uy = dy / len, x1 = x0 + dx, y1 = y0 + dy;
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 1.6;
    if (dashed) ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - ux * 8 - uy * 4, y1 - uy * 8 + ux * 4); ctx.lineTo(x1 - ux * 8 + uy * 4, y1 - uy * 8 - ux * 4);
    ctx.closePath(); ctx.fill();
    if (label) { ctx.font = '11px "JetBrains Mono", monospace'; ctx.fillText(label, x1 + 6 + ux * 4, y1 + 4 + uy * 6); }
    ctx.restore();
  }

  /* ---------- Fig. 1: inclined plane ---------- */
  var pc = $('plane-canvas');
  if (!pc) return;
  var inputs = { theta: $('pl-theta'), m: $('pl-mass'), muS: $('pl-mus'), muK: $('pl-muk') };
  var pos = 0.35, vel = 0, raf = 0, last = 0;

  function readPlane() {
    if (+inputs.muK.value > +inputs.muS.value) inputs.muK.value = inputs.muS.value;   // kinetic friction never exceeds static
    return planeState(+inputs.theta.value, +inputs.m.value, +inputs.muS.value, +inputs.muK.value);
  }

  function drawPlane() {
    var s = readPlane(), th = +inputs.theta.value * Math.PI / 180;
    var c = fit(pc, 0.62), ctx = c.ctx, w = c.w, h = c.h;
    var ink = css('--text'), mut = css('--text-3'), mech = css('--mech'), math = css('--math');
    ctx.clearRect(0, 0, w, h);
    var x0 = 24, y0 = h - 26, R = Math.min(w - 60, (h - 40) / Math.max(Math.sin(th), 0.01));
    var T = { x: x0, y: y0 - R * Math.sin(th) }, P = { x: x0 + R * Math.cos(th), y: y0 };
    var d = { x: Math.cos(th), y: Math.sin(th) }, n = { x: Math.sin(th), y: -Math.cos(th) };
    // ground and ramp
    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, y0 + 0.5); ctx.lineTo(w - 8, y0 + 0.5); ctx.stroke();
    ctx.fillStyle = css('--surface-2');
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(T.x, T.y); ctx.lineTo(P.x, P.y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(P.x, P.y, 26, Math.PI, Math.PI + th); ctx.stroke();
    ctx.fillStyle = ink; ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('θ = ' + inputs.theta.value + '°', P.x - 86, P.y - 8);
    // block
    var b = 30, sPx = pos * R;
    var C = { x: T.x + d.x * sPx + n.x * b / 2, y: T.y + d.y * sPx + n.y * b / 2 };
    ctx.save(); ctx.translate(C.x, C.y); ctx.rotate(th);
    ctx.fillStyle = s.sliding ? mech : css('--surface'); ctx.strokeStyle = ink;
    ctx.fillRect(-b / 2, -b / 2, b, b); ctx.strokeRect(-b / 2, -b / 2, b, b);
    ctx.restore();
    // vectors, scaled so mg at the largest mass is about 110px
    var k = 110 / (10 * G);
    arrow(ctx, C.x, C.y, 0, s.W * k, ink, 'mg');
    arrow(ctx, C.x, C.y, d.x * s.along * k, d.y * s.along * k, mut, 'mg sinθ', true);
    arrow(ctx, C.x, C.y, -n.x * s.N * k, -n.y * s.N * k, mut, 'mg cosθ', true);
    arrow(ctx, C.x, C.y, n.x * s.N * k, n.y * s.N * k, math, 'N');
    arrow(ctx, C.x - d.x * b / 2, C.y - d.y * b / 2, -d.x * s.f * k, -d.y * s.f * k, mech, 'f');

    $('pl-theta-out').textContent = inputs.theta.value + '°';
    $('pl-mass-out').textContent = (+inputs.m.value).toFixed(1);
    $('pl-mus-out').textContent = (+inputs.muS.value).toFixed(2);
    $('pl-muk-out').textContent = (+inputs.muK.value).toFixed(2);
    Object.keys(inputs).forEach(function (key) {
      var el = inputs[key];
      el.style.setProperty('--fill', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
    });
    var st = $('plane-status');
    st.textContent = s.sliding ? 'Sliding: mg sinθ > μs N, a = ' + f2(s.a) + ' m/s²' : 'Static: f = mg sinθ ≤ μs N';
    st.classList.toggle('is-sliding', s.sliding);
    $('plane-read').innerHTML =
      '<div><dt>mg sinθ</dt><dd>' + f2(s.along) + ' N</dd></div>' +
      '<div><dt>N = mg cosθ</dt><dd>' + f2(s.N) + ' N</dd></div>' +
      '<div><dt>μs N (max static)</dt><dd>' + f2(s.fMax) + ' N</dd></div>' +
      '<div><dt>Friction f</dt><dd>' + f2(s.f) + ' N</dd></div>' +
      '<div><dt>Slips above</dt><dd>' + s.critical.toFixed(1) + '°</dd></div>';
    return s;
  }

  function tick(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var s = readPlane();
    if (!s.sliding) { raf = 0; return; }
    vel += s.a * dt;
    pos += vel * dt / 4;                       // shortcut: 4 m of ramp drawn per full length, fine for a picture
    if (pos > 0.82) { pos = 0.18; vel = 0; }   // back to the top and slide again
    drawPlane();
    raf = requestAnimationFrame(tick);
  }
  function updatePlane() {
    var s = drawPlane();
    if (!s.sliding) { pos = 0.35; vel = 0; drawPlane(); }
    if (s.sliding && !reduceMotion && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  Object.keys(inputs).forEach(function (key) { inputs[key].addEventListener('input', updatePlane); });

  /* ---------- Fig. 2: x(t), v(t), a(t) ---------- */
  var cc = $('calc-canvas'), tIn = $('calc-t'), T0 = 0, T1 = 4.5;

  function drawCalc() {
    var t = +tIn.value, c = fit(cc, 0.5), ctx = c.ctx, w = c.w, h = c.h, pad = 28;
    var ink = css('--text'), mut = css('--text-3'), math = css('--math'), mech = css('--mech');
    var lo = 0, hi = 8;                                   // x(t) stays within [2, 6.4] on [0, 4.5]
    function X(tt) { return pad + (tt - T0) / (T1 - T0) * (w - 2 * pad); }
    function Y(xx) { return h - pad - (xx - lo) / (hi - lo) * (h - 2 * pad); }
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = mut; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad / 2); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad / 2, h - pad); ctx.stroke();
    ctx.fillStyle = mut; ctx.font = '10px "JetBrains Mono", monospace';
    for (var k = 0; k <= 4; k++) ctx.fillText(String(k), X(k) - 3, h - pad + 14);
    ctx.fillText('t (s)', w - pad - 26, h - pad - 6); ctx.fillText('x', pad + 6, pad / 2 + 8);
    ctx.strokeStyle = ink; ctx.lineWidth = 1.8; ctx.beginPath();
    for (var i = 0; i <= 120; i++) { var tt = T0 + (T1 - T0) * i / 120; if (i) ctx.lineTo(X(tt), Y(x(tt))); else ctx.moveTo(X(tt), Y(x(tt))); }
    ctx.stroke();
    // tangent: its slope is v(t)
    var span = 0.7, ya = x(t) - v(t) * span, yb = x(t) + v(t) * span;
    ctx.strokeStyle = math; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(X(t - span), Y(ya)); ctx.lineTo(X(t + span), Y(yb)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = mech; ctx.beginPath(); ctx.arc(X(t), Y(x(t)), 4, 0, Math.PI * 2); ctx.fill();

    $('calc-t-out').textContent = t.toFixed(2);
    tIn.style.setProperty('--fill', (t / T1 * 100) + '%');
    $('calc-read').innerHTML =
      '<div><dt>x(t)</dt><dd>' + f2(x(t)) + ' m</dd></div>' +
      '<div><dt>v = dx/dt</dt><dd>' + f2(v(t)) + ' m/s</dd></div>' +
      '<div><dt>a = d²x/dt²</dt><dd>' + f2(acc(t)) + ' m/s²</dd></div>';
    return { X: X };
  }
  tIn.addEventListener('input', drawCalc);
  // moving the pointer along the graph picks the time
  cc.addEventListener('pointermove', function (e) {
    var r = cc.getBoundingClientRect(), pad = 28;
    var t = T0 + (e.clientX - r.left - pad) / (r.width - 2 * pad) * (T1 - T0);
    tIn.value = Math.max(T0, Math.min(T1, Math.round(t * 20) / 20));
    drawCalc();
  });

  function drawAll() { updatePlane(); drawCalc(); }
  window.addEventListener('resize', drawAll);
  document.addEventListener('mathrix:theme', drawAll);
  // the Study Hub starts hidden; draw once it has a size
  if ('ResizeObserver' in window) new ResizeObserver(function () { if (pc.clientWidth) drawAll(); }).observe(pc);
  drawAll();
})();
