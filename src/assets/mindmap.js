/* Interactive concept map: every way to build an AI agent. */
(function () {
  'use strict';
  var ROOT = document.body.getAttribute('data-root') || '';
  var M = 'methods/', MOD = 'modules/';

  // kind: nocode | lowcode | code | concept
  var DATA = { name: 'Building AI agents', desc: 'Pick a branch to open it. Each leaf links to the page where it is taught. The branches answer different questions: what you build with (1–7), what every agent is made of (8), how agents connect (9), how they are arranged (10), and where they show up for users (11).', children: [
    { name: '1 · Configure an assistant', kind: 'nocode', desc: 'No code at all. You write instructions, attach files and switch on tools inside a chat product. Fastest way to a useful helper; limited autonomy and integration.', link: M + 'no-code-assistants.html', children: [
      { name: 'ChatGPT: workspace agents and plugins', kind: 'nocode', desc: 'OpenAI\'s successors to custom GPTs (which retire on 11 December 2026). Workspace agents run in the cloud for Business, Enterprise and Edu plans and can ask permission before sensitive steps.', link: M + 'no-code-assistants.html' },
      { name: 'Claude Projects, connectors and skills', kind: 'nocode', desc: 'A Project holds instructions and knowledge files; connectors (built on MCP) reach your apps; skills package repeatable procedures.', link: M + 'no-code-assistants.html' },
      { name: 'Gemini Gems', kind: 'nocode', desc: 'Reusable Gemini assistants with instructions and files, convenient for Google Workspace teams.', link: M + 'no-code-assistants.html' },
      { name: 'Microsoft 365 Copilot agents', kind: 'nocode', desc: 'Lightweight agents made inside Microsoft 365 Copilot. When you need actions, approvals or governance, graduate to Copilot Studio.', link: M + 'copilot-studio.html' }
    ] },
    { name: '2 · Low-code agent builders', kind: 'lowcode', desc: 'Visual builders with real tools, knowledge sources, triggers and admin controls. The usual home for enterprise "citizen developer" agents.', link: M + 'copilot-studio.html', children: [
      { name: 'Microsoft Copilot Studio', kind: 'lowcode', desc: 'Topics, generative orchestration, knowledge from SharePoint and files, Power Automate flows and connectors as tools, MCP, autonomous triggers, publishing to Teams.', link: M + 'copilot-studio.html' },
      { name: 'Salesforce Agentforce Builder', kind: 'lowcode', desc: 'Topics, instructions and actions over CRM data, with the Einstein Trust Layer.', link: M + 'enterprise-platforms.html' },
      { name: 'Google Agent Studio / Gemini Enterprise', kind: 'lowcode', desc: 'Google\'s no-code and low-code agent building inside the Gemini Enterprise Agent Platform (the successor to Vertex AI, April 2026).', link: M + 'enterprise-platforms.html' },
      { name: 'ServiceNow AI agents', kind: 'lowcode', desc: 'Agents that work inside IT, HR and customer service workflows on the Now Platform, governed from AI Control Tower.', link: M + 'enterprise-platforms.html' }
    ] },
    { name: '3 · Workflow automation + AI', kind: 'lowcode', desc: 'Start from a business workflow (trigger, steps, approvals) and drop an AI agent into one of the steps. Great when the process is mostly fixed and only one step needs judgement.', link: M + 'workflow-automation.html', children: [
      { name: 'n8n AI Agent node', kind: 'lowcode', desc: 'Open, self-hostable. Agent node with model, memory and tools; human review of chosen tool calls.', link: M + 'workflow-automation.html' },
      { name: 'Zapier Agents', kind: 'lowcode', desc: 'Agents that use thousands of Zapier app integrations as tools.', link: M + 'workflow-automation.html' },
      { name: 'Make AI agents', kind: 'lowcode', desc: 'Visual scenarios with AI agent modules.', link: M + 'workflow-automation.html' },
      { name: 'Power Automate + AI Builder', kind: 'lowcode', desc: 'Microsoft\'s workflow engine, approvals and document AI; often the tool layer behind Copilot Studio.', link: M + 'workflow-automation.html' }
    ] },
    { name: '4 · Enterprise agent platforms', kind: 'lowcode', desc: 'Buy or build where your data already lives: CRM, ITSM, ERP, or your cloud. The deciding question is usually data gravity, not model quality.', link: M + 'enterprise-platforms.html', children: [
      { name: 'Salesforce Agentforce', kind: 'lowcode', desc: 'Agents for sales and service grounded in Salesforce data.', link: M + 'enterprise-platforms.html' },
      { name: 'ServiceNow', kind: 'lowcode', desc: 'Agentic workflows for IT, HR and customer operations.', link: M + 'enterprise-platforms.html' },
      { name: 'SAP Joule agents', kind: 'lowcode', desc: 'Agents across SAP business processes (finance, procurement, supply chain).', link: M + 'enterprise-platforms.html' },
      { name: 'AWS Bedrock AgentCore', kind: 'code', desc: 'Managed runtime, memory, identity, gateway and observability for agents built with any framework.', link: M + 'enterprise-platforms.html' },
      { name: 'Gemini Enterprise Agent Platform', kind: 'code', desc: 'Google Cloud\'s agent platform (formerly Vertex AI): Agent Studio, ADK, managed runtime, evaluation, registry.', link: M + 'enterprise-platforms.html' },
      { name: 'Microsoft Foundry Agent Service', kind: 'code', desc: 'Prompt, workflow and hosted code agents with Entra identities, publishing to M365 Copilot and Teams.', link: M + 'enterprise-platforms.html' }
    ] },
    { name: '5 · Agent frameworks (code)', kind: 'code', desc: 'Python or TypeScript libraries that give you the agent loop, tools, memory, multi-agent orchestration and tracing. Full control, more engineering.', link: M + 'index.html', children: [
      { name: 'LangChain + LangGraph', kind: 'code', desc: 'create_agent for quick builds; StateGraph for explicit, checkpointed workflows with human interrupts.', link: M + 'langgraph.html' },
      { name: 'CrewAI', kind: 'code', desc: 'Role-based crews (role, goal, backstory) plus Flows for deterministic control.', link: M + 'crewai.html' },
      { name: 'Microsoft Agent Framework', kind: 'code', desc: 'Open-source successor that unifies AutoGen and Semantic Kernel; agents, tools, workflows.', link: M + 'microsoft-agent-framework.html' },
      { name: 'OpenAI Agents SDK', kind: 'code', desc: 'Agents, handoffs, guardrails, sessions and built-in tracing.', link: M + 'openai-agents-sdk.html' },
      { name: 'Claude Agent SDK', kind: 'code', desc: 'The harness behind Claude Code: file, shell and web tools, custom tools via MCP, hooks for approvals, subagents.', link: M + 'claude-agent-sdk.html' },
      { name: 'Google ADK', kind: 'code', desc: 'Agent Development Kit: agents, workflows, sessions, dev UI, A2A support.', link: M + 'google-adk.html' },
      { name: 'LlamaIndex', kind: 'code', desc: 'Document-heavy agents: parsing, indexes, query engines as tools, agent workflows.', link: M + 'llamaindex.html' },
      { name: 'Others to know', kind: 'code', desc: 'Pydantic AI, Hugging Face smolagents, AWS Strands Agents, Haystack, Mastra (TypeScript). Same ideas, different ergonomics.', link: 'resources.html' }
    ] },
    { name: '6 · Raw model API (DIY loop)', kind: 'code', desc: 'Call a model with tool definitions, run the tools yourself, loop until done. About sixty lines of code, and the best way to understand what every framework does.', link: M + 'api-tool-use.html', children: [
      { name: 'Anthropic Messages API tool use', kind: 'code', desc: 'tool_use blocks in, tool_result blocks back.', link: M + 'api-tool-use.html' },
      { name: 'OpenAI Responses API function calling', kind: 'code', desc: 'function_call items in, function_call_output back.', link: M + 'api-tool-use.html' },
      { name: 'Gemini function calling', kind: 'code', desc: 'Same pattern on Google\'s models.', link: MOD + 'm04-tools-and-function-calling.html' },
      { name: 'Open-weight models you host', kind: 'code', desc: 'Llama, Qwen, Mistral, DeepSeek and others served with Ollama or vLLM, for data that cannot leave your servers.', link: MOD + 'm02-llms-for-managers.html' }
    ] },
    { name: '7 · Specialised agent types', kind: 'concept', desc: 'Agents defined by how they act on the world rather than how they are built.', children: [
      { name: 'Voice agents', kind: 'lowcode', desc: 'Speech in, speech out, over phone or web. Latency and turn-taking are the hard parts.', link: M + 'voice-agents.html' },
      { name: 'Browser and computer-use agents', kind: 'code', desc: 'Operate websites and desktop apps through screenshots and clicks; for systems without APIs.', link: M + 'computer-use.html' },
      { name: 'Coding agents', kind: 'code', desc: 'Claude Code, OpenAI Codex, GitHub Copilot coding agent, Cursor. Also useful for analysts automating reports.', link: M + 'claude-agent-sdk.html' },
      { name: 'Research agents', kind: 'nocode', desc: '"Deep research" modes that search, read and write a cited report. Check every citation.', link: MOD + 'm08-multi-agent-systems.html' },
      { name: 'Chatbots and assistants', kind: 'nocode', desc: 'Conversational front ends, from FAQ bots to agentic assistants.', link: 'chatbots.html' }
    ] },
    { name: '8 · Building blocks (every agent)', kind: 'concept', desc: 'Whatever method you choose, you are assembling the same parts. Learn them once in the modules.', link: MOD + 'm01-what-is-an-agent.html', children: [
      { name: 'Model (the reasoning engine)', kind: 'concept', desc: 'Choice of model drives quality, speed and cost.', link: MOD + 'm02-llms-for-managers.html' },
      { name: 'Instructions / system prompt', kind: 'concept', desc: 'Role, goal, rules, tool guidance, escalation, output format.', link: MOD + 'm03-instructions-and-prompts.html' },
      { name: 'Tools and actions', kind: 'concept', desc: 'Functions the agent can call: read tools and write tools.', link: MOD + 'm04-tools-and-function-calling.html' },
      { name: 'Knowledge (RAG)', kind: 'concept', desc: 'Grounding answers in your documents, with citations and access control.', link: MOD + 'm05-knowledge-and-rag.html' },
      { name: 'Memory and state', kind: 'concept', desc: 'Short-term context, long-term memory, checkpoints for long processes.', link: MOD + 'm06-memory-and-state.html' },
      { name: 'Guardrails and approvals', kind: 'concept', desc: 'Least-privilege tools, validation, human-in-the-loop, audit.', link: MOD + 'm11-guardrails-and-responsible-ai.html' },
      { name: 'Evaluation and observability', kind: 'concept', desc: 'Golden test sets, tracing, metrics, regression tests.', link: MOD + 'm10-evaluation.html' }
    ] },
    { name: '9 · Connect and interoperate', kind: 'concept', desc: 'Standards that let agents reach tools and each other without one-off integrations.', link: MOD + 'm09-protocols-mcp-a2a.html', children: [
      { name: 'MCP: Model Context Protocol', kind: 'code', desc: 'One server exposes your tools, resources and prompts to any MCP-capable agent.', link: M + 'mcp.html' },
      { name: 'A2A: Agent2Agent protocol', kind: 'concept', desc: 'Agents from different vendors discover each other (agent cards) and hand over tasks.', link: MOD + 'm09-protocols-mcp-a2a.html' },
      { name: 'OpenAPI actions and webhooks', kind: 'lowcode', desc: 'The older, still common way to expose a REST API to an agent.', link: M + 'no-code-assistants.html' }
    ] },
    { name: '10 · Architecture patterns', kind: 'concept', desc: 'How the work is arranged. Start with the simplest pattern that solves the problem.', link: MOD + 'm07-design-patterns.html', children: [
      { name: 'Single agent with tools', kind: 'concept', desc: 'One model, a handful of tools, a loop. Most business agents should start here.', link: MOD + 'm04-tools-and-function-calling.html' },
      { name: 'Workflows: chain, route, parallelise', kind: 'concept', desc: 'Predictable, fixed paths with LLM steps inside.', link: MOD + 'm07-design-patterns.html' },
      { name: 'Evaluator-optimizer and reflection', kind: 'concept', desc: 'One step drafts, another critiques, loop until good enough.', link: MOD + 'm07-design-patterns.html' },
      { name: 'Orchestrator-workers / supervisor', kind: 'concept', desc: 'A lead agent splits the job and delegates to specialists.', link: MOD + 'm08-multi-agent-systems.html' },
      { name: 'Hierarchical and network (swarm)', kind: 'concept', desc: 'Larger teams of agents; powerful, costly, harder to debug.', link: MOD + 'm08-multi-agent-systems.html' },
      { name: 'Human-in-the-loop', kind: 'concept', desc: 'Pause for approval on irreversible or high-value actions.', link: MOD + 'm06-memory-and-state.html' }
    ] },
    { name: '11 · Where agents meet users', kind: 'concept', desc: 'Deployment channels and triggers. The same agent can serve several.', link: MOD + 'm12-deployment-and-llmops.html', children: [
      { name: 'Teams, Slack, email', kind: 'lowcode', desc: 'Where employees already work.', link: M + 'copilot-studio.html' },
      { name: 'Website widget and WhatsApp', kind: 'lowcode', desc: 'Customer-facing chat; WhatsApp matters a lot in India.', link: 'chatbots.html' },
      { name: 'Phone and voice', kind: 'lowcode', desc: 'Contact centres and outbound calls.', link: M + 'voice-agents.html' },
      { name: 'Inside SaaS apps', kind: 'lowcode', desc: 'CRM, ITSM, ERP side panels.', link: M + 'enterprise-platforms.html' },
      { name: 'Background jobs and schedules', kind: 'code', desc: 'Autonomous agents triggered by events or a timetable, no chat at all.', link: MOD + 'm12-deployment-and-llmops.html' },
      { name: 'API for other systems', kind: 'code', desc: 'Wrap the agent behind an endpoint so any app can call it.', link: MOD + 'm12-deployment-and-llmops.html' }
    ] }
  ] };

  var KIND = { nocode: 'No-code', lowcode: 'Low-code', code: 'Code', concept: 'Concept' };
  var host = document.getElementById('mm-canvas'), detail = document.getElementById('mm-detail'), outline = document.getElementById('mm-outline');
  if (!host) return;
  var NS = 'http://www.w3.org/2000/svg';
  var open = {}; DATA.children.forEach(function (b, i) { open[i] = i < 2; });
  var filter = 'all', selected = null;

  function el(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function matches(n) { return filter === 'all' || n.kind === filter; }

  function render() {
    var X0 = 16, W0 = 200, X1 = 262, W1 = 292, X2 = 610, W2 = 304, ROW = 34, BROW = 46, PAD = 18;
    var y = PAD, branches = [];
    DATA.children.forEach(function (b, i) {
      var leaves = [];
      if (open[i]) {
        var start = y;
        b.children.forEach(function (lf) { leaves.push({ n: lf, y: y + 14 }); y += ROW; });
        y += 14;
        branches.push({ n: b, i: i, y: (start + y - 14) / 2 - 3, leaves: leaves });
      } else {
        branches.push({ n: b, i: i, y: y + 17, leaves: [] }); y += BROW;
      }
    });
    var H = y + PAD, W = X2 + W2 + 16;
    var rootY = Math.min((branches[0].y + branches[branches.length - 1].y) / 2, 190);
    host.innerHTML = '';
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Concept map of the ways to build an AI agent' }, host);
    var links = el('g', {}, svg), nodes = el('g', {}, svg);
    function link(x1, y1, x2, y2) { var mx = (x1 + x2) / 2; el('path', { class: 'mm-link', d: 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2 }, links); }
    function node(n, x, yc, w, h, cls, tint, onclick, label) {
      var g = el('g', { class: 'mm-node ' + cls + (selected === n ? ' sel' : ''), tabindex: '0', role: 'button', 'aria-label': label || n.name }, nodes);
      var r = el('rect', { x: x, y: yc - h / 2, width: w, height: h, rx: cls === 'root' ? 10 : 7 }, g);
      if (tint) r.setAttribute('class', 'fx-box ' + tint); else if (cls === 'leaf') r.setAttribute('class', 'fx-box');
      var t = el('text', { x: x + 12, y: yc + 4.5 }, g); t.textContent = n.name;
      if (cls === 'leaf' && !matches(n)) g.style.opacity = '.28';
      g.addEventListener('click', onclick);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick(); } });
      return g;
    }
    var tints = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'];
    branches.forEach(function (b) {
      link(X0 + W0, rootY, X1, b.y);
      var tint = tints[b.i % 6];
      var g = node(b.n, X1, b.y, W1, 34, 'branch', tint, function () { open[b.i] = !open[b.i]; selected = b.n; show(b.n); render(); }, b.n.name + (open[b.i] ? ', collapse' : ', expand'));
      var tg = el('text', { class: 'tog', x: X1 + W1 - 18, y: b.y + 4.5 }, g); tg.textContent = open[b.i] ? '−' : '+';
      b.leaves.forEach(function (l) {
        link(X1 + W1, b.y, X2, l.y);
        node(l.n, X2, l.y, W2, 26, 'leaf', null, function () { selected = l.n; show(l.n); render(); });
      });
    });
    node(DATA, X0, rootY, W0, 44, 'root', null, function () { selected = DATA; show(DATA); render(); });
  }

  function show(n) {
    var h = '<h3>' + n.name.replace(/^\d+ · /, '') + '</h3><div class="tags">' + (n.kind ? '<span class="tag">' + KIND[n.kind] + '</span>' : '') + (n.children ? '<span class="tag">' + n.children.length + ' items</span>' : '') + '</div><p>' + n.desc + '</p>';
    if (n.link) h += '<p><a class="btn sm" href="' + ROOT + n.link + '">Open the page →</a></p>';
    detail.innerHTML = h;
  }

  function renderOutline() {
    var h = '<ol>';
    DATA.children.forEach(function (b) {
      h += '<li><b>' + (b.link ? '<a href="' + ROOT + b.link + '">' + b.name.replace(/^\d+ · /, '') + '</a>' : b.name.replace(/^\d+ · /, '')) + '</b> <span class="muted small">' + b.desc + '</span><ul>';
      b.children.forEach(function (l) { h += '<li><a href="' + ROOT + l.link + '">' + l.name + '</a> <span class="tag">' + KIND[l.kind] + '</span> <span class="small">' + l.desc + '</span></li>'; });
      h += '</ul></li>';
    });
    outline.innerHTML = h + '</ol>';
  }

  document.querySelectorAll('[data-mm]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.getAttribute('data-mm');
      if (a === 'expand') DATA.children.forEach(function (_, i) { open[i] = true; });
      if (a === 'collapse') DATA.children.forEach(function (_, i) { open[i] = false; });
      render();
    });
  });
  var fsel = document.getElementById('mm-filter');
  if (fsel) fsel.addEventListener('change', function () { filter = fsel.value; if (filter !== 'all') DATA.children.forEach(function (b, i) { open[i] = b.children.some(matches); }); render(); });

  show(DATA); render(); if (outline) renderOutline();
})();
