/* AI Agents for Management — shared site behaviour.
   Theme, mobile nav, on-this-page, quizzes, tabs, copy buttons, videos, progress, search. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ROOT = document.body.getAttribute('data-root') || '';
  var PAGE = document.body.getAttribute('data-page') || '';

  function load(k, fb) { try { var v = localStorage.getItem('aiam.' + k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } }
  function save(k, v) { try { localStorage.setItem('aiam.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  /* ---------- theme ---------- */
  var SUN = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/></svg>';
  var MOON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M13.5 9.6A5.7 5.7 0 0 1 6.4 2.5a5.7 5.7 0 1 0 7.1 7.1z"/></svg>';
  function currentDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintThemeBtns() { $$('[data-theme-toggle]').forEach(function (b) { b.innerHTML = currentDark() ? SUN : MOON; b.setAttribute('aria-label', currentDark() ? 'Switch to light theme' : 'Switch to dark theme'); }); }
  var savedTheme = load('theme', null);
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  paintThemeBtns();
  $$('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = currentDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next); save('theme', next); paintThemeBtns();
    });
  });

  /* ---------- mobile nav ---------- */
  var menuBtn = $('#menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('nav-open') && !e.target.closest('.rail') && !e.target.closest('#menu-btn')) document.body.classList.remove('nav-open');
  });
  var cur = $('.nav a[aria-current="page"]');
  var rail = $('.rail'); if (cur && rail && cur.offsetTop > rail.clientHeight - 120) rail.scrollTop = cur.offsetTop - rail.clientHeight / 2;

  /* ---------- progress ---------- */
  var done = load('done', {}) || {};
  var TRACK = (document.body.getAttribute('data-track') || '').split(',').filter(Boolean);
  function paintProgress() {
    $$('.nav a[data-id]').forEach(function (a) { a.classList.toggle('is-done', !!done[a.getAttribute('data-id')]); });
    var n = TRACK.filter(function (id) { return done[id]; }).length;
    var c = $('#pcount'); if (c) c.textContent = n + ' / ' + TRACK.length;
    var bar = $('#pbar'); if (bar) bar.style.width = (TRACK.length ? (100 * n / TRACK.length) : 0) + '%';
    var btn = $('.donebtn');
    if (btn) { var d = !!done[PAGE]; btn.classList.toggle('is-done', d); btn.textContent = d ? '✓ Marked as complete' : 'Mark this page complete'; btn.setAttribute('aria-pressed', d ? 'true' : 'false'); }
  }
  var doneBtn = $('.donebtn');
  if (doneBtn) doneBtn.addEventListener('click', function () { if (done[PAGE]) delete done[PAGE]; else done[PAGE] = Date.now(); save('done', done); paintProgress(); });
  paintProgress();

  /* ---------- on this page ---------- */
  var toc = $('#toc');
  var secs = $$('.article > section[id]').filter(function (s) { return $('h2', s); });
  if (toc && secs.length > 1) {
    var html = '<p>On this page</p>';
    secs.forEach(function (s) { html += '<a href="#' + s.id + '">' + $('h2', s).textContent + '</a>'; });
    toc.innerHTML = html;
    var links = $$('a', toc);
    var spy = function () {
      var y = window.scrollY + 120, on = 0;
      secs.forEach(function (s, i) { if (s.offsetTop <= y) on = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === on); });
    };
    window.addEventListener('scroll', spy, { passive: true }); spy();
  } else if (toc) { toc.hidden = true; }

  /* ---------- tabs ---------- */
  $$('.tabs').forEach(function (box, bi) {
    var tabs = $$(':scope > .tab', box);
    if (!tabs.length) return;
    var bar = document.createElement('div'); bar.className = 'tabbar'; bar.setAttribute('role', 'tablist');
    tabs.forEach(function (t, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab');
      b.textContent = t.getAttribute('data-label') || ('Tab ' + (i + 1));
      b.id = 'tab-' + bi + '-' + i; t.setAttribute('role', 'tabpanel'); t.setAttribute('aria-labelledby', b.id);
      b.addEventListener('click', function () { select(i); });
      bar.appendChild(b);
    });
    function select(i) { tabs.forEach(function (t, j) { t.classList.toggle('on', i === j); bar.children[j].setAttribute('aria-selected', i === j ? 'true' : 'false'); }); }
    box.insertBefore(bar, tabs[0]); box.classList.add('js'); select(0);
  });

  /* ---------- code: language label, highlight, copy ---------- */
  $$('pre.code').forEach(function (pre) {
    var code = $('code', pre); if (!code) return;
    var m = (code.className || '').match(/language-(\w+)/);
    if (m && m[1] !== 'plaintext') pre.setAttribute('data-lang', m[1]); else pre.setAttribute('data-lang', 'text');
    if (window.hljs && m && m[1] !== 'plaintext') { try { window.hljs.highlightElement(code); } catch (e) { /* leave plain */ } }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'copybtn'; b.textContent = 'Copy';
    b.addEventListener('click', function () {
      var txt = code.innerText;
      var ok = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
      var fallback = function () { var r = document.createRange(); r.selectNodeContents(code); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selected · press Ctrl+C'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback();
    });
    pre.appendChild(b);
  });

  /* ---------- quizzes ---------- */
  $$('.quiz').forEach(function (quiz, qi) {
    var qs = $$('.q', quiz); var right = 0, answered = 0;
    var score = document.createElement('div'); score.className = 'quiz-score';
    var reset = document.createElement('button'); reset.type = 'button'; reset.className = 'btn sm ghost'; reset.textContent = 'Try again';
    function paint() { score.innerHTML = '<span>Score <b>' + right + ' / ' + qs.length + '</b></span><span class="muted">' + (answered < qs.length ? (qs.length - answered) + ' left' : (right === qs.length ? 'Full marks.' : 'Read the explanations, then try again.')) + '</span>'; score.appendChild(reset); }
    qs.forEach(function (q) {
      var ans = (q.getAttribute('data-answer') || '').trim().toLowerCase();
      $$('.q-opts > li', q).forEach(function (li) {
        var k = (li.getAttribute('data-k') || '').toLowerCase();
        var b = document.createElement('button'); b.type = 'button';
        b.innerHTML = '<span class="k">' + k + '</span><span>' + li.innerHTML + '</span>';
        li.innerHTML = ''; li.appendChild(b);
        b.addEventListener('click', function () {
          if (q.classList.contains('answered')) return;
          q.classList.add('answered'); answered++;
          if (k === ans) { b.classList.add('right'); right++; } else {
            b.classList.add('wrong');
            $$('.q-opts > li', q).forEach(function (l2) { if ((l2.getAttribute('data-k') || '').toLowerCase() === ans) $('button', l2).classList.add('right'); });
          }
          $$('button', q).forEach(function (x) { x.disabled = true; });
          paint();
        });
      });
    });
    reset.addEventListener('click', function () {
      right = 0; answered = 0;
      qs.forEach(function (q) { q.classList.remove('answered'); $$('.q-opts button', q).forEach(function (x) { x.disabled = false; x.classList.remove('right', 'wrong'); }); });
      paint();
    });
    paint(); quiz.appendChild(score);
  });

  /* ---------- videos: click a thumbnail to play inline ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.vid-thumb'); if (!t) return;
    var id = t.getAttribute('data-yt'); if (!id) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    f.title = t.getAttribute('aria-label') || 'Video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.setAttribute('allowfullscreen', '');
    t.replaceWith(f);
  });
  $$('.vid-thumb img').forEach(function (img) { img.addEventListener('error', function () { img.remove(); }); });

  /* ---------- figure tools: download any SVG figure ---------- */
  $$('figure.fig[data-dl]').forEach(function (fig, i) {
    var svg = $('svg', fig); if (!svg) return;
    var bar = document.createElement('div'); bar.className = 'fig-tools';
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Download PNG';
    b.addEventListener('click', function () { exportPng(svg, fig.getAttribute('data-dl') || ('figure-' + (i + 1)), b); });
    bar.appendChild(b); fig.appendChild(bar);
  });
  function exportPng(svg, name, btn) {
    var cs = getComputedStyle(document.documentElement);
    var clone = svg.cloneNode(true);
    var vb = (svg.getAttribute('viewBox') || '0 0 720 400').split(/\s+/).map(Number);
    var W = vb[2] * 2, H = vb[3] * 2;
    // inline computed styles so the PNG keeps the current theme
    var src = $$('*', svg), dst = $$('*', clone);
    src.forEach(function (el, i) {
      var s = getComputedStyle(el), d = dst[i];
      ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'font-family', 'font-size', 'font-weight', 'opacity'].forEach(function (p) { d.style.setProperty(p, s.getPropertyValue(p)); });
    });
    var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', vb[0]); bg.setAttribute('y', vb[1]); bg.setAttribute('width', vb[2]); bg.setAttribute('height', vb[3]);
    bg.setAttribute('fill', cs.getPropertyValue('--surface').trim() || '#fff');
    clone.insertBefore(bg, clone.firstChild);
    var defs = $('#fx-defs'); if (defs) clone.insertBefore(defs.querySelector('defs').cloneNode(true), clone.firstChild);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', W); clone.setAttribute('height', H);
    var data = new XMLSerializer().serializeToString(clone);
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      c.getContext('2d').drawImage(img, 0, 0, W, H);
      c.toBlob(function (blob) {
        if (!blob) return;
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        btn.textContent = 'Saved'; setTimeout(function () { btn.textContent = 'Download PNG'; }, 1500);
      });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
  }

  /* ---------- search ---------- */
  var modal = null, input, results, sel = 0, hits = [];
  function ensureIndex(cb) {
    if (window.SEARCH_INDEX) return cb();
    var s = document.createElement('script'); s.src = ROOT + 'assets/search-index.js'; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function openSearch() {
    if (!modal) {
      modal = document.createElement('div'); modal.className = 'search-modal'; modal.hidden = true;
      modal.innerHTML = '<div class="search-box" role="dialog" aria-label="Search the course"><input id="search-input" type="search" placeholder="Search modules, methods, terms…" autocomplete="off"><div class="search-results"></div></div>';
      document.body.appendChild(modal);
      input = $('input', modal); results = $('.search-results', modal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); });
      input.addEventListener('input', run);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, hits.length - 1); paintSel(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); paintSel(); e.preventDefault(); }
        else if (e.key === 'Enter') { var a = $$('a', results)[sel]; if (a) a.click(); }
        else if (e.key === 'Escape') closeSearch();
      });
    }
    modal.hidden = false; input.value = ''; results.innerHTML = '<div class="search-empty">Type to search ' + 'all pages, sections and glossary terms.</div>';
    setTimeout(function () { input.focus(); }, 10);
    ensureIndex(function () {});
  }
  function closeSearch() { if (modal) modal.hidden = true; }
  function paintSel() { $$('a', results).forEach(function (a, i) { a.classList.toggle('sel', i === sel); }); }
  function run() {
    var q = input.value.trim().toLowerCase();
    if (!q || !window.SEARCH_INDEX) { results.innerHTML = q ? '<div class="search-empty">Loading index…</div>' : ''; return; }
    var words = q.split(/\s+/).filter(Boolean);
    hits = [];
    window.SEARCH_INDEX.forEach(function (r) {
      var hay = (r.p + ' ' + r.s + ' ' + r.x).toLowerCase(), score = 0, ok = true;
      words.forEach(function (w) {
        var i = hay.indexOf(w); if (i < 0) { ok = false; return; }
        score += 1; if ((r.s || '').toLowerCase().indexOf(w) >= 0) score += 3; if (r.p.toLowerCase().indexOf(w) >= 0) score += 2;
      });
      if (ok) hits.push({ r: r, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; }); hits = hits.slice(0, 30); sel = 0;
    if (!hits.length) { results.innerHTML = '<div class="search-empty">No matches. Try a shorter word, like "RAG" or "approval".</div>'; return; }
    var re = new RegExp('(' + words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'ig');
    results.innerHTML = hits.map(function (h) {
      var r = h.r, x = r.x, i = x.toLowerCase().indexOf(words[0]);
      var snip = x.slice(Math.max(0, i - 60), i + 120);
      return '<a href="' + ROOT + r.u + '"><small>' + esc(r.p) + '</small><b>' + esc(r.s).replace(re, '<mark>$1</mark>') + '</b><span>' + (i > 60 ? '…' : '') + esc(snip).replace(re, '<mark>$1</mark>') + '…</span></a>';
    }).join('');
    paintSel();
  }
  $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', openSearch); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/input|textarea|select/i.test((e.target.tagName || '')) && !e.target.isContentEditable) { e.preventDefault(); openSearch(); }
  });

  /* ---------- hero trace replay ---------- */
  var ht = $('.hero-trace');
  if (ht) {
    var rows = $$('.trace > div', ht);
    var replay = function () { ht.classList.remove('play'); void ht.offsetWidth; rows.forEach(function (r, i) { r.style.animationDelay = (i * 0.35) + 's'; }); ht.classList.add('play'); };
    var rb = $('[data-replay]'); if (rb) rb.addEventListener('click', replay);
  }
})();
