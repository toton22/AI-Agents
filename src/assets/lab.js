/* Agent Lab: (1) step-through simulator of the Meridian Deal Desk agent, (2) live agent with your own API key. */
(function () {
  'use strict';
  var MD = window.MERIDIAN; if (!MD) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function J(o) { return JSON.stringify(o); }

  /* ======================= side panel: data the agent can see ======================= */
  function paintData(hitId, hitRules) {
    var rows = Object.keys(MD.CUSTOMERS).map(function (id) {
      var c = MD.CUSTOMERS[id];
      return '<div class="row' + (id === hitId ? ' hit' : '') + '">' + id + ' · ' + esc(c.name) + '<br>' + c.tier + ' · ₹' + c.revenue_lakh + ' lakh · late ' + c.late_payments + ' · margin ' + c.margin_pct + '%</div>';
    }).join('');
    var rules = MD.POLICY.split('\n').slice(1).map(function (r, i) { return '<div class="row' + (hitRules && hitRules.indexOf(i + 1) >= 0 ? ' hit' : '') + '">' + esc(r) + '</div>'; }).join('');
    var box = $('#sim-data');
    if (box) box.innerHTML = '<h4>Customer records</h4><div class="kv">' + rows + '</div><h4 style="margin-top:14px">Discount policy</h4><div class="kv">' + rules + '</div>';
  }

  /* ======================= (1) simulator ======================= */
  var PRESETS = [
    { label: 'Sahyadri Hospitals asks for 10%', text: 'Sahyadri Hospitals wants 10% off their next order. Can we do it?' },
    { label: 'Bluewave Logistics asks for 6%', text: 'Bluewave Logistics is asking for 6% on the Q3 order. OK?' },
    { label: 'Kite Fintech asks for 5%', text: 'Can Kite Fintech get 5% off?' },
    { label: 'Orchid Schools asks for 14%', text: 'Orchid Schools Trust wants 14% for the annual contract.' },
    { label: 'Trident Engineering asks for 8%', text: 'Trident Engineering wants 8%, can we approve?' },
    { label: 'Orchid Schools asks for 18%', text: 'Orchid Schools Trust says a rival offered 18%. Can we match?' },
    { label: 'Unknown customer', text: 'Give Sunrise Bakers 7% off.' }
  ];
  var steps = [], at = 0, trace = $('#sim-trace .trace');

  function plan(text) {
    var s = [];
    s.push({ cls: 't-user', html: esc(text) });
    var pm = String(text).match(/(\d+(?:\.\d+)?)\s*%/);
    var c = MD.findCustomer(text);
    s.push({ cls: 't-think', html: 'First I need to know who the customer is and how much they are asking for.' });
    var guessName = c ? c.name : (String(text).match(/(?:[Gg]ive|for|get)\s+([A-Z][\w]+(?:\s+[A-Z][\w]+)*)/) || [, 'the customer'])[1];
    s.push({ cls: 't-act', html: 'find_customer(name="' + esc(guessName) + '")' });
    if (!c) {
      s.push({ cls: 't-obs', html: '{"error": "no customer matches \\"' + esc(guessName) + '\\""}', data: [null, []] });
      s.push({ cls: 't-think', html: 'No match. I must not guess a customer or invent their terms.' });
      s.push({ cls: 't-final', html: 'I couldn\'t find "' + esc(guessName) + '" in our customer records. Could you give me the customer ID or the exact registered name? I won\'t quote a discount until I can check their record.' });
      return s;
    }
    s.push({ cls: 't-obs', html: esc(J(c)), data: [c.id, []] });
    if (!pm) {
      s.push({ cls: 't-final', html: 'Found ' + esc(c.name) + ' (' + c.tier + '). What discount percentage are they asking for?' });
      return s;
    }
    var d = Number(pm[1]);
    s.push({ cls: 't-act', html: 'get_discount_policy()' });
    s.push({ cls: 't-obs', html: 'Bronze 5%, Silver 8%, Gold 12%. 2+ late payments: cap 3%. Margin floor 12%. Above cap: Sales Manager. Above 15%: Regional Head.', data: [c.id, [1, 2, 3, 4]] });
    var cap = MD.capFor(c);
    s.push({ cls: 't-think', html: c.tier + ' tier cap is ' + MD.TIER_CAP[c.tier] + '%.' + (c.late_payments >= 2 ? ' But ' + c.late_payments + ' late payments this year, so the cap drops to 3%.' : ' Late payments: ' + c.late_payments + ', so no reduction.') + ' Effective cap: ' + cap + '%. Now the margin check.', data: [c.id, c.late_payments >= 2 ? [1, 2] : [1]] });
    s.push({ cls: 't-act', html: 'margin_after_discount(current_margin_pct=' + c.margin_pct + ', discount_pct=' + d + ')' });
    var after = MD.marginAfter(c.margin_pct, d);
    s.push({ cls: 't-obs', html: String(after), data: [c.id, [3]] });
    var r = MD.decide(c, d);
    if (r.ok) {
      s.push({ cls: 't-think', html: d + '% is within the ' + cap + '% cap and margin stays at ' + after + '% (floor 12%). I can approve this myself.' });
      s.push({ cls: 't-final', html: '<span class="status-pill ok">Approved within policy</span><br>' + esc(c.name) + ' can have ' + d + '%. Margin after discount: ' + after + '%.<br><br>Draft reply: "Dear team at ' + esc(c.name) + ', thank you for your continued business. We\'re pleased to confirm a ' + d + '% discount on your next order. Regards, Meridian Supplies."' });
      return s;
    }
    s.push({ cls: 't-think', html: 'I can\'t approve this: ' + esc(r.reasons.join('; ')) + '. ' + (d > 15 ? 'It is above 15%, so it goes to the Regional Head.' : 'It goes to the Sales Manager.') + ' I\'ll suggest the most I could approve.', data: [c.id, d > 15 ? [4] : [4]] });
    var maxOk = Math.max(0, Math.min(cap, c.margin_pct - 12));
    s.push({ cls: 't-act', html: 'request_approval(customer_id="' + c.id + '", discount_pct=' + d + ', approver="' + r.approver + '", reason="' + esc(r.reasons.join('; ')) + '")' });
    s.push({ cls: 't-human', human: true, c: c, d: d, approver: r.approver, maxOk: maxOk });
    return s;
  }

  function addRow(st) {
    var div = document.createElement('div'); div.className = st.cls;
    if (st.human) {
      div.innerHTML = '<span>Waiting for the <b>' + esc(st.approver) + '</b> to decide on ' + st.d + '% for ' + esc(st.c.name) + '. You are the ' + esc(st.approver) + ':</span><span class="hitl" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">' +
        '<button class="btn sm" type="button" data-h="yes">Approve ' + st.d + '%</button>' +
        (st.maxOk > 0 ? '<button class="btn sm" type="button" data-h="counter">Counter with ' + st.maxOk + '%</button>' : '') +
        '<button class="btn sm ghost" type="button" data-h="no">Reject</button></span>';
      div.querySelectorAll('button[data-h]').forEach(function (b) {
        b.addEventListener('click', function () {
          var h = b.getAttribute('data-h'), msg, fin;
          if (h === 'yes') { msg = st.approver + ' approved ' + st.d + '%.'; fin = '<span class="status-pill warn">Approved by ' + esc(st.approver) + '</span><br>' + esc(st.c.name) + ' gets ' + st.d + '% (approval logged). Draft reply prepared for your review.'; }
          else if (h === 'counter') { msg = st.approver + ' counter-offered ' + st.maxOk + '%.'; fin = '<span class="status-pill warn">Counter-offer</span><br>Offer ' + esc(st.c.name) + ' ' + st.maxOk + '%, the most policy allows without exception. Draft: "We can offer ' + st.maxOk + '% on this order and would be glad to review terms again next quarter."'; }
          else { msg = st.approver + ' rejected the request.'; fin = '<span class="status-pill err">Not approved</span><br>No exception this time. Draft reply: a polite no, with the standard ' + MD.capFor(st.c) + '% offer if margin allows.'; }
          div.innerHTML = esc(msg);
          var f = document.createElement('div'); f.className = 't-final'; f.innerHTML = fin; trace.appendChild(f);
          trace.parentNode.scrollTop = trace.parentNode.scrollHeight;
          setButtons(true);
        });
      });
    } else div.innerHTML = st.html;
    trace.appendChild(div);
    if (st.data) paintData(st.data[0], st.data[1]);
    var box = trace.parentNode; box.scrollTop = box.scrollHeight;
  }
  function setButtons(finished) {
    var stepB = $('#sim-step'), runB = $('#sim-run');
    if (stepB) stepB.disabled = finished; if (runB) runB.disabled = finished;
  }
  function start(text) { trace.innerHTML = ''; steps = plan(text); at = 0; paintData(null, []); setButtons(false); }
  function step() { if (at < steps.length) { addRow(steps[at]); at++; } if (at >= steps.length && !steps[steps.length - 1].human) setButtons(true); if (at >= steps.length && steps[steps.length - 1].human) { $('#sim-step').disabled = true; $('#sim-run').disabled = true; } }
  function runAll() { while (at < steps.length) step(); }

  var presetSel = $('#sim-preset'), req = $('#sim-request');
  if (presetSel && trace) {
    PRESETS.forEach(function (p, i) { var o = document.createElement('option'); o.value = i; o.textContent = p.label; presetSel.appendChild(o); });
    presetSel.addEventListener('change', function () { req.value = PRESETS[presetSel.value].text; start(req.value); });
    $('#sim-step').addEventListener('click', step);
    $('#sim-run').addEventListener('click', runAll);
    $('#sim-reset').addEventListener('click', function () { start(req.value); });
    $('#sim-form').addEventListener('submit', function (e) { e.preventDefault(); start(req.value); runAll(); });
    req.value = PRESETS[0].text; start(req.value); runAll();
  }

  /* ======================= (2) live agent with your own key ======================= */
  var TOOLS = [
    { name: 'find_customer', description: 'Look up a Meridian customer by (partial) name. Returns id, tier, late_payments this FY and current gross margin_pct.', params: { type: 'object', properties: { name: { type: 'string', description: 'Customer name as typed by the salesperson' } }, required: ['name'] } },
    { name: 'get_customer', description: 'Get a customer record by customer id such as C-101.', params: { type: 'object', properties: { customer_id: { type: 'string' } }, required: ['customer_id'] } },
    { name: 'get_discount_policy', description: 'Return the current discount policy text. Always read it before deciding.', params: { type: 'object', properties: {} } },
    { name: 'margin_after_discount', description: 'Compute gross margin after a discount: current_margin_pct minus discount_pct.', params: { type: 'object', properties: { current_margin_pct: { type: 'number' }, discount_pct: { type: 'number' } }, required: ['current_margin_pct', 'discount_pct'] } },
    { name: 'request_approval', description: 'Ask a human approver to approve a discount that is outside policy. Use approver "Sales Manager" or "Regional Head" (above 15%). Blocks until the human answers.', params: { type: 'object', properties: { customer_id: { type: 'string' }, discount_pct: { type: 'number' }, approver: { type: 'string', enum: ['Sales Manager', 'Regional Head'] }, reason: { type: 'string' } }, required: ['customer_id', 'discount_pct', 'approver', 'reason'] } }
  ];
  var SYSTEM = 'You are the Meridian Supplies Deal Desk agent. Salespeople ask whether a customer can have a discount.\n' +
    'Always: (1) look up the customer with find_customer or get_customer, (2) read the policy with get_discount_policy, (3) compute the margin with margin_after_discount.\n' +
    'If the discount is within the effective cap and margin stays at or above 12%, approve it and draft a short, polite reply to the customer.\n' +
    'Otherwise never promise the discount: call request_approval with the right approver and a one-line reason, then report the approver\'s decision.\n' +
    'Never invent customers, numbers or policy. Keep answers under 120 words. Use Indian English and ₹.';

  var live = { history: [], busy: false };
  var liveTrace = $('#live-trace .trace'), liveForm = $('#live-form');
  function lrow(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; liveTrace.appendChild(d); liveTrace.parentNode.scrollTop = liveTrace.parentNode.scrollHeight; return d; }

  function runTool(name, args) {
    return new Promise(function (resolve) {
      try {
        if (name === 'find_customer') { var c = MD.findCustomer(args.name); paintLive(c && c.id); return resolve(c ? J(c) : J({ error: 'No customer matches "' + args.name + '"' })); }
        if (name === 'get_customer') { var c2 = MD.getCustomer(args.customer_id); paintLive(c2 && c2.id); return resolve(c2 ? J(c2) : J({ error: 'Unknown id ' + args.customer_id })); }
        if (name === 'get_discount_policy') return resolve(MD.POLICY);
        if (name === 'margin_after_discount') return resolve(String(MD.marginAfter(args.current_margin_pct, args.discount_pct)));
        if (name === 'request_approval') {
          var row = lrow('t-human', '<span><b>' + esc(args.approver) + '</b>, approve ' + esc(args.discount_pct) + '% for ' + esc(args.customer_id) + '? Reason given: ' + esc(args.reason) + '</span><span style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px"><button class="btn sm" type="button" data-a="approved">Approve</button><button class="btn sm ghost" type="button" data-a="rejected">Reject</button></span>');
          row.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { var a = b.getAttribute('data-a'); row.innerHTML = esc(args.approver + ' ' + a + ' ' + args.discount_pct + '% for ' + args.customer_id + '.'); resolve(J({ status: a, approver: args.approver, discount_pct: args.discount_pct })); }); });
          return;
        }
        resolve(J({ error: 'Unknown tool ' + name }));
      } catch (e) { resolve(J({ error: String(e) })); }
    });
  }
  function paintLive(id) { var b = $('#live-data'); if (!b) return; b.querySelectorAll('.row').forEach(function (r) { r.classList.toggle('hit', id && r.getAttribute('data-id') === id); }); }

  async function callModel(cfg, messages) {
    if (cfg.provider === 'anthropic') {
      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: J({ model: cfg.model, max_tokens: 1024, system: cfg.system, tools: TOOLS.map(function (t) { return { name: t.name, description: t.description, input_schema: t.params }; }), messages: messages })
      });
      var data = await res.json();
      if (!res.ok) throw new Error((data.error && data.error.message) || ('HTTP ' + res.status));
      return data;
    }
    var res2 = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + cfg.key },
      body: J({ model: cfg.model, messages: [{ role: 'system', content: cfg.system }].concat(messages), tools: TOOLS.map(function (t) { return { type: 'function', function: { name: t.name, description: t.description, parameters: t.params } }; }) })
    });
    var d2 = await res2.json();
    if (!res2.ok) throw new Error((d2.error && d2.error.message) || ('HTTP ' + res2.status));
    return d2;
  }

  async function liveTurn(text) {
    var cfg = { provider: $('#live-provider').value, key: $('#live-key').value.trim(), model: $('#live-model').value.trim(), system: $('#live-system').value };
    if (!cfg.key) { lrow('t-final', 'Add an API key first. It stays in this page\'s memory and is sent only to the provider you picked.'); return; }
    live.busy = true; $('#live-send').disabled = true;
    lrow('t-user', esc(text));
    var msgs = live.history; msgs.push({ role: 'user', content: text });
    try {
      for (var i = 0; i < 8; i++) {
        var out = await callModel(cfg, msgs);
        if (cfg.provider === 'anthropic') {
          msgs.push({ role: 'assistant', content: out.content });
          var uses = out.content.filter(function (b) { return b.type === 'tool_use'; });
          out.content.filter(function (b) { return b.type === 'text' && b.text.trim(); }).forEach(function (b) { lrow(uses.length ? 't-think' : 't-final', esc(b.text)); });
          if (out.stop_reason !== 'tool_use' || !uses.length) break;
          var results = [];
          for (var u = 0; u < uses.length; u++) {
            lrow('t-act', esc(uses[u].name + '(' + J(uses[u].input) + ')'));
            var r = await runTool(uses[u].name, uses[u].input);
            lrow('t-obs', esc(r));
            results.push({ type: 'tool_result', tool_use_id: uses[u].id, content: r });
          }
          msgs.push({ role: 'user', content: results });
        } else {
          var m = out.choices[0].message; msgs.push(m);
          if (m.content) lrow(m.tool_calls ? 't-think' : 't-final', esc(m.content));
          if (!m.tool_calls || !m.tool_calls.length) break;
          for (var k = 0; k < m.tool_calls.length; k++) {
            var tc = m.tool_calls[k], args = {};
            try { args = JSON.parse(tc.function.arguments || '{}'); } catch (e) { args = {}; }
            lrow('t-act', esc(tc.function.name + '(' + J(args) + ')'));
            var r2 = await runTool(tc.function.name, args);
            lrow('t-obs', esc(r2));
            msgs.push({ role: 'tool', tool_call_id: tc.id, content: r2 });
          }
        }
        if (i === 7) lrow('t-final', 'Stopped after 8 steps (the safety limit). Ask again or rephrase.');
      }
    } catch (e) {
      lrow('t-final', '<span class="status-pill err">Error</span> ' + esc(e.message || e) + '<br><span class="small">If this says "Failed to fetch", the page is running somewhere that blocks calls to outside services (for example a sandboxed preview). Open the site from GitHub Pages or a local file instead, and check the key and model name.</span>');
      live.history = [];
    }
    live.busy = false; $('#live-send').disabled = false;
  }

  if (liveForm && liveTrace) {
    var MODELS = { anthropic: 'claude-haiku-4-5-20251001', openai: 'gpt-5-mini' };
    var prov = $('#live-provider'), model = $('#live-model');
    $('#live-system').value = SYSTEM; model.value = MODELS.anthropic;
    prov.addEventListener('change', function () { model.value = MODELS[prov.value]; live.history = []; });
    liveForm.addEventListener('submit', function (e) { e.preventDefault(); var q = $('#live-input'); if (!q.value.trim() || live.busy) return; var t = q.value; q.value = ''; liveTurn(t); });
    $('#live-clear').addEventListener('click', function () { live.history = []; liveTrace.innerHTML = '<div class="t-final">New conversation. The agent has the five Meridian tools; try one of the example requests.</div>'; });
    document.querySelectorAll('[data-live-ex]').forEach(function (b) { b.addEventListener('click', function () { $('#live-input').value = b.textContent; $('#live-input').focus(); }); });
    var ld = $('#live-data');
    if (ld) ld.innerHTML = '<h4>Tools the agent can call</h4><div class="kv">' + TOOLS.map(function (t) { return '<div class="row">' + t.name + '()<br><span style="font-family:var(--font-ui)">' + esc(t.description) + '</span></div>'; }).join('') + '</div><h4 style="margin-top:14px">Customer records</h4><div class="kv">' + Object.keys(MD.CUSTOMERS).map(function (id) { var c = MD.CUSTOMERS[id]; return '<div class="row" data-id="' + id + '">' + id + ' · ' + esc(c.name) + ' · ' + c.tier + ' · late ' + c.late_payments + ' · margin ' + c.margin_pct + '%</div>'; }).join('') + '</div>';
  }
})();
