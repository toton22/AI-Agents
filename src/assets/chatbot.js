/* Chatbot demo: one helpdesk, three generations of bot (rules, retrieval, agentic), plus build-your-own from an FAQ. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var KB = [
    { id: 'HR-01', q: 'How many days of earned leave do I get?', a: 'Full-time employees earn 18 days of earned leave per calendar year, credited at 1.5 days per month. Up to 30 days can be carried forward.', src: 'Leave Policy §2' },
    { id: 'HR-02', q: 'How do I apply for leave?', a: 'Apply in the HR portal under Leave > Apply at least 3 working days in advance (except sick leave). Your manager approves it in the portal.', src: 'Leave Policy §4' },
    { id: 'HR-03', q: 'How much sick leave is allowed?', a: 'You get 8 days of sick leave a year. A medical certificate is needed for more than 2 consecutive sick days.', src: 'Leave Policy §3' },
    { id: 'HR-04', q: 'What is the maternity and paternity leave policy?', a: 'Maternity leave is 26 weeks as per the Maternity Benefit Act. Paternity leave is 10 working days, to be taken within 3 months of the birth or adoption.', src: 'Leave Policy §6' },
    { id: 'HR-05', q: 'When is salary credited?', a: 'Salary is credited on the last working day of each month. Payslips appear in the HR portal under Payroll by the 2nd of the following month.', src: 'Payroll FAQ' },
    { id: 'HR-06', q: 'How do I submit investment proofs for tax?', a: 'Upload investment proofs in the HR portal under Payroll > Tax Declarations between 1 and 31 January. Late submissions are processed in the next cycle.', src: 'Payroll FAQ' },
    { id: 'HR-07', q: 'What is the work from home policy?', a: 'Hybrid roles may work from home up to 2 days a week with manager approval. Sales and warehouse roles are on-site.', src: 'Hybrid Work Policy' },
    { id: 'HR-08', q: 'How do I claim travel expenses?', a: 'Submit travel claims in the expense app within 15 days of the trip with bills attached. Claims above ₹25,000 need your department head\'s approval.', src: 'Travel & Expense Policy §5' },
    { id: 'HR-09', q: 'What is the daily allowance for business travel?', a: 'Daily allowance is ₹1,500 in metro cities and ₹1,000 elsewhere, covering meals and local travel. Hotel stays are booked by the travel desk.', src: 'Travel & Expense Policy §3' },
    { id: 'HR-10', q: 'How do I refer a candidate for a job?', a: 'Use Careers > Refer a Friend in the HR portal. If your referral joins and completes 90 days, you receive a referral bonus as per the current scheme.', src: 'Referral Policy' },
    { id: 'HR-11', q: 'What are the office timings? What time does work start?', a: 'Standard hours are 9:30 am to 6:00 pm, Monday to Friday, with a 30-minute lunch break. Warehouse shifts follow the roster.', src: 'Employee Handbook §1' },
    { id: 'HR-12', q: 'What holidays does Meridian observe?', a: 'Meridian observes 12 paid holidays a year, including Republic Day, Independence Day, Gandhi Jayanti, Diwali and Holi. The full list for Pune is on the HR portal.', src: 'Holiday Calendar' },
    { id: 'HR-13', q: 'How do I update my bank account details?', a: 'Update bank details in the HR portal under Profile > Bank. Changes made after the 20th apply from the next month\'s salary.', src: 'Payroll FAQ' },
    { id: 'HR-14', q: 'Who do I contact about harassment or a POSH complaint?', a: 'Contact the Internal Committee at ic@meridian.example or any IC member listed on the HR portal. Complaints are handled confidentially under the POSH Act.', src: 'POSH Policy' },
    { id: 'IT-01', q: 'I forgot my password. How do I reset it?', a: 'Use the self-service reset at the login screen (Forgot password). You will get an OTP on your registered mobile. If that fails, raise an IT ticket.', src: 'IT Helpdesk KB-004' },
    { id: 'IT-02', q: 'How do I connect to the VPN?', a: 'Install the company VPN client from the Software Centre, sign in with your Meridian ID and approve the prompt in the authenticator app.', src: 'IT Helpdesk KB-011' },
    { id: 'IT-03', q: 'My laptop is slow or broken. What should I do?', a: 'Restart it and install pending updates first. If the problem continues, raise an IT ticket with the asset tag on the bottom of the laptop.', src: 'IT Helpdesk KB-020' },
    { id: 'IT-04', q: 'How do I get access to a shared drive or software?', a: 'Request access through the IT portal under Access Requests. Your manager approves it, and access is usually granted within one working day.', src: 'IT Helpdesk KB-015' },
    { id: 'IT-05', q: 'Can I use ChatGPT or other AI tools at work?', a: 'Only approved AI tools listed on the intranet may be used with company data. Never paste customer data, pricing or employee records into unapproved tools.', src: 'Acceptable Use Policy §7' }
  ];
  var EMP = {
    'E-201': { name: 'Ananya Kulkarni', el: 11.5, sl: 6, mgr: 'Rohit Deshpande' },
    'E-202': { name: 'Farhan Shaikh', el: 4, sl: 8, mgr: 'Rohit Deshpande' },
    'E-203': { name: 'Meera Iyer', el: 21, sl: 2, mgr: 'Kavita Rao' },
    'E-204': { name: 'Gurpreet Singh', el: 0, sl: 5, mgr: 'Kavita Rao' },
    'E-205': { name: 'Neha Joshi', el: 9, sl: 7, mgr: 'Arjun Menon' }
  };

  /* ---------------- tiny TF-IDF retriever ---------------- */
  var STOP = 'a an the is are am do does did i my me we our you your to of for in on at and or how what when who can could should with it this that be get got as by from about there any not much many will would'.split(' ');
  function tok(s) { return String(s).toLowerCase().replace(/[^a-z0-9₹ ]/g, ' ').split(/\s+/).filter(function (w) { return w && STOP.indexOf(w) < 0; }).map(stem); }
  function stem(w) { if (w.length <= 4) return w; w = w.replace(/(lling)$/, 'l').replace(/(ing|ed|es|s)$/, ''); return w; }
  function Index(docs) {
    this.docs = docs; var df = {}, N = docs.length, self = this;
    this.vecs = docs.map(function (d) { var t = tok(d.q + ' ' + d.q + ' ' + d.a), tf = {}; t.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; }); Object.keys(tf).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); return tf; });
    this.idf = {}; Object.keys(df).forEach(function (w) { self.idf[w] = Math.log(1 + N / df[w]); });
    this.vecs = this.vecs.map(function (tf) { var v = {}, n = 0; Object.keys(tf).forEach(function (w) { v[w] = tf[w] * self.idf[w]; n += v[w] * v[w]; }); n = Math.sqrt(n) || 1; Object.keys(v).forEach(function (w) { v[w] /= n; }); return v; });
  }
  Index.prototype.coverage = function (q) {
    var self = this, N = this.docs.length, tot = 0, hit = 0;
    tok(q).forEach(function (w) { var i = self.idf[w] || Math.log(1 + N / 0.5); tot += i; if (self.idf[w]) hit += i; });
    return tot ? hit / tot : 0;
  };
  Index.prototype.search = function (q, k) {
    var self = this, qt = tok(q), qv = {}, n = 0;
    qt.forEach(function (w) { qv[w] = (qv[w] || 0) + (self.idf[w] || 0); });
    Object.keys(qv).forEach(function (w) { n += qv[w] * qv[w]; }); n = Math.sqrt(n) || 1;
    return this.vecs.map(function (v, i) { var s = 0; Object.keys(qv).forEach(function (w) { if (v[w]) s += v[w] * qv[w] / n; }); return { d: self.docs[i], s: s }; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, k || 3);
  };

  /* ---------------- the three bots ---------------- */
  var RULES = [
    { k: ['leave', 'holiday', 'vacation'], id: 'HR-01' }, { k: ['salary', 'payslip', 'pay'], id: 'HR-05' },
    { k: ['password'], id: 'IT-01' }, { k: ['vpn'], id: 'IT-02' }, { k: ['travel', 'expense'], id: 'HR-08' }, { k: ['wfh', 'home'], id: 'HR-07' }
  ];
  function byId(id) { for (var i = 0; i < KB.length; i++) if (KB[i].id === id) return KB[i]; }
  var state = { mode: 'rag', kb: KB, index: new Index(KB), pending: null, emp: null };

  function ruleBot(text) {
    var t = text.toLowerCase();
    if (/^(hi|hello|hey|menu)\b/.test(t)) return { a: 'Hi! I can help with: leave, salary, password, VPN, travel, work from home. Type one of those words.' };
    for (var i = 0; i < RULES.length; i++) for (var j = 0; j < RULES[i].k.length; j++) if (t.indexOf(RULES[i].k[j]) >= 0) { var d = byId(RULES[i].id); return { a: d.a, src: d.src, trace: ['Matched keyword "' + RULES[i].k[j] + '" → canned answer ' + d.id] }; }
    return { a: 'Sorry, I didn\'t understand. Type "menu" to see what I can help with.', trace: ['No keyword matched → fallback message'] };
  }
  function ragBot(text) {
    var hits = state.index.search(text, 3);
    var tr = hits.map(function (h) { return h.d.id + ' · score ' + h.s.toFixed(2) + ' · ' + h.d.q; });
    var cov = state.index.coverage(text);
    tr.unshift('Query coverage ' + Math.round(cov * 100) + '% (share of your words found in the knowledge base)');
    if (!hits.length || hits[0].s < 0.12 || cov < 0.4) return { a: 'I couldn\'t find this in the policies I have. I\'ve noted your question for the HR team; you can also email hr@meridian.example.', hits: hits, low: true, trace: ['Confidence too low (best match ' + (hits[0] ? hits[0].s.toFixed(2) : '0') + ', coverage ' + Math.round(cov * 100) + '%) → admit "I don\'t know" instead of guessing'].concat(tr) };
    return { a: hits[0].d.a, src: hits[0].d.src, hits: hits, trace: ['Retrieved top 3 by similarity; answered from the best match'].concat(tr) };
  }
  function agentBot(text) {
    var t = text.toLowerCase(), m = text.match(/\bE-?\s?(\d{3})\b/i);
    if (m) state.emp = 'E-' + m[1];
    // confirmation for a pending action (human in the loop)
    if (state.pending && !/^(y|yes|confirm|ok|okay|sure|haan|ha|n|no|nope|cancel)\b/.test(t)) {
      state.pending = null;  // user moved on: drop the unconfirmed action and handle the new message
    }
    if (state.pending) {
      var p = state.pending; state.pending = null;
      if (/^(y|yes|confirm|ok|okay|sure|haan|ha)\b/.test(t)) {
        if (p.type === 'leave') return { a: 'Done. Leave request LV-' + (4100 + Math.floor(Math.random() * 800)) + ' for ' + p.days + ' day(s) sent to ' + p.mgr + ' for approval. You\'ll get an email when they decide.', trace: ['Tool call: apply_leave(employee="' + p.emp + '", days=' + p.days + ')', 'Result: request created, routed to manager'] };
        if (p.type === 'ticket') return { a: 'Ticket IT-' + (52000 + Math.floor(Math.random() * 900)) + ' raised: "' + p.summary + '". The IT desk usually responds within 4 working hours.', trace: ['Tool call: create_it_ticket(summary="' + p.summary + '")', 'Result: ticket created'] };
      }
      return { a: 'Okay, I\'ve cancelled that. Nothing was submitted.', trace: ['User declined → no action taken'] };
    }
    // intent: leave balance
    if (/(balance|how many|left|remaining)/.test(t) && /(leave|el|sick|sl)/.test(t)) {
      if (!state.emp) return { a: 'I can check that. What\'s your employee ID? (Try E-201 to E-205 in this demo.)', trace: ['Intent: leave_balance · missing slot: employee_id → ask'] };
      var e = EMP[state.emp]; if (!e) { state.emp = null; return { a: 'I couldn\'t find that employee ID. Please check it (demo IDs are E-201 to E-205).', trace: ['Tool call: get_leave_balance → not found'] }; }
      return { a: e.name + ', you have ' + e.el + ' days of earned leave and ' + e.sl + ' days of sick leave left this year.', src: 'HR system (live lookup)', trace: ['Intent: leave_balance', 'Tool call: get_leave_balance(employee="' + state.emp + '")', 'Result: EL ' + e.el + ', SL ' + e.sl] };
    }
    // intent: apply leave
    var dm = t.match(/(\d+(?:\.\d)?)\s*(day|days)/);
    if (/(apply|take|book|need)/.test(t) && /leave|off|day/.test(t) && dm) {
      if (!state.emp) return { a: 'Sure. What\'s your employee ID? Then I\'ll set up the request.', trace: ['Intent: apply_leave · missing slot: employee_id'] };
      var e2 = EMP[state.emp], days = Number(dm[1]);
      if (!e2) return { a: 'I couldn\'t find that employee ID.', trace: ['Lookup failed'] };
      if (days > e2.el) return { a: 'You asked for ' + days + ' days but have ' + e2.el + ' days of earned leave left. ' + (e2.el > 0 ? 'I can apply for ' + e2.el + ' days instead, or you' : 'You') + ' can talk to ' + e2.mgr + ' about leave without pay. I haven\'t submitted anything.', trace: ['Tool call: get_leave_balance(employee="' + state.emp + '")', 'Check: requested ' + days + ' > balance ' + e2.el + ' → do not submit'] };
      state.pending = { type: 'leave', emp: state.emp, days: days, mgr: e2.mgr };
      return { a: 'I\'ll apply for ' + days + ' day(s) of earned leave for ' + e2.name + ', to be approved by ' + e2.mgr + '. Shall I submit it? (yes / no)', trace: ['Intent: apply_leave', 'Tool call: get_leave_balance → ' + e2.el + ' days available', 'Write action → ask the user to confirm first'] };
    }
    // intent: IT problem → ticket
    if (/(not working|broken|slow|error|crash|can't|cannot|unable)/.test(t)) {
      var r0 = ragBot(text);
      state.pending = { type: 'ticket', summary: text.slice(0, 80) };
      return { a: (!r0.low ? r0.a + '\n\n' : '') + 'If that doesn\'t fix it, I can raise an IT ticket for you. Raise one now? (yes / no)', src: r0.src, hits: r0.hits, trace: ['Intent: it_issue', 'Retrieved self-help article first'].concat(r0.trace || []).concat(['Write action → confirm before creating ticket']) };
    }
    var r = ragBot(text); r.trace = ['Intent: policy_question → retrieve and answer'].concat(r.trace || []); return r;
  }

  /* ---------------- UI ---------------- */
  var log = $('#bot-log'), side = $('#bot-side'), form = $('#bot-form'), input = $('#bot-input');
  if (!log) return;
  function add(cls, text, src) { var d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = text; if (src) { var s = document.createElement('span'); s.className = 'src'; s.textContent = 'Source: ' + src; d.appendChild(s); } log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function paintSide(r) {
    var h = '<h4>What the bot did</h4><div class="kv">' + (r.trace || ['—']).map(function (t) { return '<div class="row">' + esc(t) + '</div>'; }).join('') + '</div>';
    if (r.hits) h += '<h4 style="margin-top:14px">Retrieved passages</h4><div class="kv">' + r.hits.map(function (x, i) { return '<div class="row' + (i === 0 && !r.low ? ' hit' : '') + '">' + esc(x.d.id) + ' · ' + x.s.toFixed(2) + '<br>' + esc(x.d.q) + '</div>'; }).join('') + '</div>';
    side.innerHTML = h;
  }
  function ask(text) {
    add('user', text);
    var r = state.mode === 'rules' ? ruleBot(text) : state.mode === 'rag' ? ragBot(text) : agentBot(text);
    add('bot', r.a, r.src); paintSide(r);
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var t = input.value.trim(); if (!t) return; input.value = ''; ask(t); });
  document.querySelectorAll('[data-bot-ex]').forEach(function (b) { b.addEventListener('click', function () { ask(b.textContent); }); });
  var modeSel = $('#bot-mode');
  var MODE_NOTE = {
    rules: 'Rule-based bot: keywords mapped to canned answers. Predictable, cheap, brittle.',
    rag: 'Retrieval bot: finds the most similar policy passage and answers from it, with the source. Says "I don\'t know" below a confidence threshold.',
    agent: 'Agentic assistant: retrieval plus tools (leave balance, apply leave, raise ticket), asks for missing details, and confirms before any write action.'
  };
  function setMode(m) { state.mode = m; state.pending = null; state.emp = null; log.innerHTML = ''; add('sys', MODE_NOTE[m]); side.innerHTML = '<h4>What the bot did</h4><p class="muted">Ask something to see the bot\'s working here.</p>'; }
  modeSel.addEventListener('change', function () { setMode(modeSel.value); if (state.kb === KB) seed(); });
  function seed() {
    if (state.mode === 'rules') { ask('How many leave days do I get?'); }
    else if (state.mode === 'rag') { ask('What is the daily allowance when I travel for work?'); }
    else { ask('How much leave do I have left? I am E-202'); }
  }

  /* build your own */
  var ta = $('#own-faq'), loadBtn = $('#own-load'), resetBtn = $('#own-reset'), note = $('#own-note');
  function parseFaq(txt) {
    var out = [], cur = null;
    txt.split(/\r?\n/).forEach(function (line) {
      var q = line.match(/^\s*Q\s*[:.)-]\s*(.+)/i), a = line.match(/^\s*A\s*[:.)-]\s*(.+)/i);
      if (q) { cur = { id: 'FAQ-' + (out.length + 1), q: q[1].trim(), a: '', src: 'Your FAQ #' + (out.length + 1) }; out.push(cur); }
      else if (a && cur) cur.a = a[1].trim();
      else if (cur && line.trim() && cur.a) cur.a += ' ' + line.trim();
    });
    return out.filter(function (d) { return d.q && d.a; });
  }
  if (loadBtn) loadBtn.addEventListener('click', function () {
    var docs = parseFaq(ta.value);
    if (docs.length < 2) { note.textContent = 'I need at least two Q:/A: pairs. Check the format in the example.'; return; }
    state.kb = docs; state.index = new Index(docs); modeSel.value = 'rag'; setMode('rag');
    add('sys', 'Loaded ' + docs.length + ' questions from your FAQ. Ask anything about them.');
    note.textContent = 'Bot now answers from your ' + docs.length + ' FAQ entries. Scroll up to the chat.';
    log.scrollIntoView({ block: 'center' });
  });
  if (resetBtn) resetBtn.addEventListener('click', function () { state.kb = KB; state.index = new Index(KB); setMode(modeSel.value); note.textContent = 'Back to the Meridian helpdesk knowledge base.'; });

  var kbList = $('#kb-list');
  if (kbList) kbList.innerHTML = KB.map(function (d) { return '<tr><td>' + d.id + '</td><td>' + esc(d.q) + '</td><td>' + esc(d.src) + '</td></tr>'; }).join('');
  setMode('rag'); seed();
})();
