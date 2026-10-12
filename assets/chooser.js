/* Method chooser: six questions → a ranked shortlist of build methods. */
(function () {
  'use strict';
  var ROOT = document.body.getAttribute('data-root') || '';
  var form = document.getElementById('chooser'); if (!form) return;
  var out = document.getElementById('chooser-out');
  var M = {
    nocode: ['Configured assistants (ChatGPT, Claude, Gemini)', 'methods/no-code-assistants.html', 'Instructions plus files in a chat product. Fastest prototype.'],
    copilot: ['Microsoft Copilot Studio', 'methods/copilot-studio.html', 'Low-code agents inside Microsoft 365 and Teams, governed by IT.'],
    workflow: ['n8n / Zapier / Make / Power Automate', 'methods/workflow-automation.html', 'An agent as one smart step in a workflow with approvals.'],
    enterprise: ['Enterprise agent platforms', 'methods/enterprise-platforms.html', 'Agentforce, ServiceNow, SAP Joule, AgentCore, Gemini Enterprise, Foundry.'],
    voice: ['Voice agents', 'methods/voice-agents.html', 'Phone and voice channels: Vapi, Retell, ElevenLabs, realtime APIs.'],
    computer: ['Browser and computer-use agents', 'methods/computer-use.html', 'Operate websites and desktop apps that have no API.'],
    api: ['Raw API with tool calling', 'methods/api-tool-use.html', 'Write the loop yourself; full control, no framework.'],
    langgraph: ['LangGraph', 'methods/langgraph.html', 'Explicit, checkpointed workflows with human interrupts.'],
    crewai: ['CrewAI', 'methods/crewai.html', 'Role-based teams of agents for research and content.'],
    maf: ['Microsoft Agent Framework', 'methods/microsoft-agent-framework.html', 'Code-first agents and workflows in the Microsoft stack.'],
    openai: ['OpenAI Agents SDK', 'methods/openai-agents-sdk.html', 'Agents, handoffs, guardrails and tracing.'],
    claude: ['Claude Agent SDK', 'methods/claude-agent-sdk.html', 'Knowledge-work agents with files, shell, MCP tools and hooks.'],
    adk: ['Google ADK', 'methods/google-adk.html', 'Agent Development Kit for Google Cloud and Workspace shops.'],
    llamaindex: ['LlamaIndex', 'methods/llamaindex.html', 'Agents over large, messy document collections.'],
    mcp: ['Build an MCP server', 'methods/mcp.html', 'Expose your systems once to every agent and assistant.']
  };
  var W = {
    skills: {
      none: { nocode: 4, copilot: 2, workflow: 1, enterprise: 1 },
      sheet: { workflow: 3, copilot: 3, nocode: 2, voice: 1, enterprise: 1 },
      python: { api: 3, langgraph: 2, crewai: 2, openai: 2, claude: 2, adk: 2, llamaindex: 2, mcp: 2, computer: 1, workflow: 1 },
      dev: { langgraph: 3, mcp: 3, api: 2, maf: 2, openai: 2, claude: 2, adk: 2, llamaindex: 2, enterprise: 2, voice: 1, computer: 1 }
    },
    data: {
      m365: { copilot: 4, maf: 2, workflow: 1 },
      google: { adk: 3, nocode: 2, enterprise: 1 },
      crm: { enterprise: 4 },
      erp: { enterprise: 4 },
      own: { mcp: 3, api: 2, langgraph: 2, workflow: 1 },
      cloud: { enterprise: 2, adk: 1, maf: 1, langgraph: 1 },
      docs: { llamaindex: 3, nocode: 2, copilot: 1 }
    },
    channel: {
      chat: { nocode: 3, claude: 1 },
      teams: { copilot: 3, workflow: 2 },
      web: { workflow: 2, api: 1, langgraph: 1, openai: 1 },
      phone: { voice: 6 },
      bg: { workflow: 2, langgraph: 2, claude: 2, crewai: 1 },
      ui: { computer: 6 }
    },
    control: {
      proto: { nocode: 2, workflow: 1, crewai: 1 },
      dept: { copilot: 2, workflow: 2, enterprise: 1 },
      core: { langgraph: 3, maf: 2, enterprise: 2, mcp: 1, api: 1 }
    },
    job: {
      docs: { llamaindex: 2, nocode: 2, copilot: 2 },
      act: { workflow: 2, mcp: 2, api: 1, openai: 1, copilot: 1 },
      research: { crewai: 3, claude: 2, langgraph: 1 },
      ui: { computer: 4 }
    },
    budget: {
      free: { nocode: 1, workflow: 1, api: 1, langgraph: 1, crewai: 1 },
      lic: { copilot: 2, enterprise: 2, nocode: 1 },
      eng: { langgraph: 1, api: 1, mcp: 1, maf: 1, adk: 1 }
    }
  };
  function run() {
    var score = {}, why = {};
    Object.keys(M).forEach(function (k) { score[k] = 0; why[k] = []; });
    var answered = 0;
    Object.keys(W).forEach(function (q) {
      var c = form.querySelector('input[name="' + q + '"]:checked'); if (!c) return; answered++;
      var add = W[q][c.value] || {};
      Object.keys(add).forEach(function (m) { score[m] += add[m]; if (add[m] >= 2) why[m].push(c.getAttribute('data-why') || c.parentNode.textContent.trim()); });
    });
    if (!answered) { out.innerHTML = '<p class="muted">Answer any of the questions to see a shortlist. It updates as you go.</p>'; return; }
    var ranked = Object.keys(M).sort(function (a, b) { return score[b] - score[a]; }).filter(function (k) { return score[k] > 0; }).slice(0, 5);
    var top = score[ranked[0]] || 1;
    out.innerHTML = '<div class="rec">' + ranked.map(function (k, i) {
      var pct = Math.round(100 * score[k] / top);
      return '<a class="rec-item' + (i === 0 ? ' top' : '') + '" href="' + ROOT + M[k][1] + '"><span class="sc">' + pct + '</span><span><b>' + M[k][0] + '</b><span>' + M[k][2] + (why[k].length ? ' Fits because: ' + why[k].slice(0, 3).join('; ').toLowerCase() + '.' : '') + '</span></span></a>';
    }).join('') + '</div><p class="small muted" style="margin-top:10px">Scores are relative to the top match (100). It\'s a starting point for discussion, not a verdict. Read the top two pages before deciding.</p>';
  }
  form.addEventListener('change', run);
  var reset = document.getElementById('chooser-reset');
  if (reset) reset.addEventListener('click', function () { form.reset(); run(); });
  run();
})();
