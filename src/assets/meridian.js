/* Meridian Supplies: shared demo data and tools used by the Agent Lab and the chatbot page. */
(function (g) {
  'use strict';
  var CUSTOMERS = {
    'C-101': { id: 'C-101', name: 'Sahyadri Hospitals', tier: 'Gold', revenue_lakh: 48, late_payments: 0, margin_pct: 22 },
    'C-102': { id: 'C-102', name: 'Bluewave Logistics', tier: 'Silver', revenue_lakh: 19, late_payments: 2, margin_pct: 18 },
    'C-103': { id: 'C-103', name: 'Orchid Schools Trust', tier: 'Gold', revenue_lakh: 31, late_payments: 0, margin_pct: 25 },
    'C-104': { id: 'C-104', name: 'Kite Fintech', tier: 'Bronze', revenue_lakh: 6, late_payments: 0, margin_pct: 16 },
    'C-105': { id: 'C-105', name: 'Trident Engineering', tier: 'Silver', revenue_lakh: 22, late_payments: 1, margin_pct: 20 }
  };
  var TIER_CAP = { Bronze: 5, Silver: 8, Gold: 12 };
  var POLICY = 'Meridian discount policy (FY 2026-27)\n' +
    '1. Maximum discount by tier: Bronze 5%, Silver 8%, Gold 12%.\n' +
    '2. Customers with 2 or more late payments this financial year are capped at 3%.\n' +
    '3. Gross margin after discount must stay at or above 12% (margin_after = current_margin - discount).\n' +
    '4. Anything above the cap needs Sales Manager approval; anything above 15% needs Regional Head approval.';

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function findCustomer(name) {
    var q = norm(name); if (!q) return null;
    var best = null, bestScore = 0;
    Object.keys(CUSTOMERS).forEach(function (id) {
      var c = CUSTOMERS[id], n = norm(c.name), score = 0;
      if (q === n || q.indexOf(n) >= 0) score = 100;
      else if (norm(id) === q) score = 100;
      else n.split(' ').forEach(function (w) { if (w.length > 3 && q.indexOf(w) >= 0) score += 10; });
      if (score > bestScore) { bestScore = score; best = c; }
    });
    return bestScore >= 10 ? best : null;
  }
  function getCustomer(id) { return CUSTOMERS[String(id || '').toUpperCase()] || null; }
  function marginAfter(m, d) { return Math.round((Number(m) - Number(d)) * 100) / 100; }
  function capFor(c) { var cap = TIER_CAP[c.tier]; if (c.late_payments >= 2) cap = Math.min(cap, 3); return cap; }
  /* The reference decision, used to check any agent's answer. */
  function decide(c, d) {
    var cap = capFor(c), after = marginAfter(c.margin_pct, d), reasons = [];
    if (c.late_payments >= 2) reasons.push(c.late_payments + ' late payments this FY, so the cap is 3%');
    if (d > cap) reasons.push(d + '% is above the ' + cap + '% cap');
    if (after < 12) reasons.push('margin after discount would be ' + after + '%, below the 12% floor');
    var ok = d <= cap && after >= 12;
    return { ok: ok, cap: cap, after: after, approver: ok ? null : (d > 15 ? 'Regional Head' : 'Sales Manager'), reasons: reasons };
  }
  g.MERIDIAN = { CUSTOMERS: CUSTOMERS, TIER_CAP: TIER_CAP, POLICY: POLICY, findCustomer: findCustomer, getCustomer: getCustomer, marginAfter: marginAfter, capFor: capFor, decide: decide };
})(window);
