#!/usr/bin/env python3
"""Build the AI Agents for Management static site.

content/**.html fragments (first line: <!--META {...} -->) are wrapped in the shared layout and
written to ../site/. The build also fills video placeholders from data/videos.json, collects every
figure into the infographics gallery, builds the methods comparison table, and writes a search index.

Usage:  python3 src/build.py      (from the repository root; writes the site into the root)
"""
import html
import json
import os
import re
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
# The built site goes in the folder ABOVE this one (the repository root), so GitHub Pages can serve it.
OUT = os.environ.get('SITE_OUT') or os.path.normpath(os.path.join(HERE, '..'))
CONTENT = os.path.join(HERE, 'content')

SITE_NAME = 'AI Agents for Management'
SITE_SUB = 'Concept to corporate deployment'
FOOTER_LEFT = 'AI Agents for Management · an open course for business students and managers'
FOOTER_RIGHT = 'Product names, features and prices change fast: check vendor docs before you rely on a detail. Last reviewed October 2026.'

# ---------------------------------------------------------------- site map
# (id, output path, source fragment, nav title, number, tracked)
NAV = [
    ('Orientation', [
        ('home', 'index.html', 'pages/index.html', 'Start here', '', False),
        ('mindmap', 'mindmap.html', 'pages/mindmap.html', 'Concept map: ways to build agents', '', False),
        ('roadmap', 'roadmap.html', 'pages/roadmap.html', 'Learning roadmap', '', False),
    ]),
    ('Level 1 · Foundations', [
        ('m01', 'modules/m01-what-is-an-agent.html', 'modules/m01-what-is-an-agent.html', None, '01', True),
        ('m02', 'modules/m02-llms-for-managers.html', 'modules/m02-llms-for-managers.html', None, '02', True),
        ('m03', 'modules/m03-instructions-and-prompts.html', 'modules/m03-instructions-and-prompts.html', None, '03', True),
        ('m04', 'modules/m04-tools-and-function-calling.html', 'modules/m04-tools-and-function-calling.html', None, '04', True),
    ]),
    ('Level 2 · Building', [
        ('m05', 'modules/m05-knowledge-and-rag.html', 'modules/m05-knowledge-and-rag.html', None, '05', True),
        ('m06', 'modules/m06-memory-and-state.html', 'modules/m06-memory-and-state.html', None, '06', True),
        ('m07', 'modules/m07-design-patterns.html', 'modules/m07-design-patterns.html', None, '07', True),
        ('m08', 'modules/m08-multi-agent-systems.html', 'modules/m08-multi-agent-systems.html', None, '08', True),
        ('m09', 'modules/m09-protocols-mcp-a2a.html', 'modules/m09-protocols-mcp-a2a.html', None, '09', True),
    ]),
    ('Level 3 · Corporate', [
        ('m10', 'modules/m10-evaluation.html', 'modules/m10-evaluation.html', None, '10', True),
        ('m11', 'modules/m11-guardrails-and-responsible-ai.html', 'modules/m11-guardrails-and-responsible-ai.html', None, '11', True),
        ('m12', 'modules/m12-deployment-and-llmops.html', 'modules/m12-deployment-and-llmops.html', None, '12', True),
        ('m13', 'modules/m13-business-case-and-governance.html', 'modules/m13-business-case-and-governance.html', None, '13', True),
    ]),
    ('Build methods · No-code & low-code', [
        ('methods', 'methods/index.html', 'pages/methods-index.html', 'Choose your method', '', False),
        ('x-nocode', 'methods/no-code-assistants.html', 'methods/no-code-assistants.html', None, 'A', True),
        ('x-copilot', 'methods/copilot-studio.html', 'methods/copilot-studio.html', None, 'B', True),
        ('x-workflow', 'methods/workflow-automation.html', 'methods/workflow-automation.html', None, 'C', True),
        ('x-enterprise', 'methods/enterprise-platforms.html', 'methods/enterprise-platforms.html', None, 'D', True),
        ('x-voice', 'methods/voice-agents.html', 'methods/voice-agents.html', None, 'E', True),
        ('x-computer', 'methods/computer-use.html', 'methods/computer-use.html', None, 'F', True),
    ]),
    ('Build methods · Code', [
        ('x-api', 'methods/api-tool-use.html', 'methods/api-tool-use.html', None, 'G', True),
        ('x-langgraph', 'methods/langgraph.html', 'methods/langgraph.html', None, 'H', True),
        ('x-crewai', 'methods/crewai.html', 'methods/crewai.html', None, 'I', True),
        ('x-maf', 'methods/microsoft-agent-framework.html', 'methods/microsoft-agent-framework.html', None, 'J', True),
        ('x-openai', 'methods/openai-agents-sdk.html', 'methods/openai-agents-sdk.html', None, 'K', True),
        ('x-claude', 'methods/claude-agent-sdk.html', 'methods/claude-agent-sdk.html', None, 'L', True),
        ('x-adk', 'methods/google-adk.html', 'methods/google-adk.html', None, 'M', True),
        ('x-llamaindex', 'methods/llamaindex.html', 'methods/llamaindex.html', None, 'N', True),
        ('x-mcp', 'methods/mcp.html', 'methods/mcp.html', None, 'O', True),
    ]),
    ('Practice', [
        ('chatbots', 'chatbots.html', 'pages/chatbots.html', 'Chatbots + live bot', '', True),
        ('lab', 'lab.html', 'pages/lab.html', 'Agent Lab', '', True),
        ('capstones', 'capstones.html', 'pages/capstones.html', 'Capstone projects', '', False),
    ]),
    ('Library', [
        ('media', 'media.html', 'pages/media.html', 'Videos & infographics', '', False),
        ('glossary', 'glossary.html', 'pages/glossary.html', 'Glossary', '', False),
        ('resources', 'resources.html', 'pages/resources.html', 'Books, courses, papers', '', False),
    ]),
]

ICON_SEARCH = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" width="15" height="15"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/></svg>'
ICON_MENU = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12"/></svg>'
BRAND_MARK = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">'
              '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/>'
              '<path d="M11 7.2 6.2 15.8M13 7.2l4.8 8.6M7.4 18h9.2"/></svg>')

META_RE = re.compile(r'^\s*<!--META\s*(\{.*?\})\s*-->', re.S)


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


def strip_tags(s):
    s = re.sub(r'<(script|style|svg|pre)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


# ---------------------------------------------------------------- load pages
PAGES = []
for group, items in NAV:
    for pid, out, src, title, num, tracked in items:
        raw = read(os.path.join(CONTENT, src))
        m = META_RE.match(raw)
        if not m:
            raise SystemExit('Missing META in ' + src)
        meta = json.loads(m.group(1))
        body = raw[m.end():]
        PAGES.append(dict(id=pid, out=out, src=src, group=group, num=num, tracked=tracked,
                          nav=title or meta.get('title'), meta=meta, body=body))
BY_ID = {p['id']: p for p in PAGES}
TRACK = [p['id'] for p in PAGES if p['tracked']]
VIDEOS = json.loads(read(os.path.join(HERE, 'data', 'videos.json')))


def rel_root(out):
    depth = out.count('/')
    return '../' * depth


# ---------------------------------------------------------------- videos
def video_card(v):
    vid = html.escape(v['id'])
    title = html.escape(v['title'])
    return ('<div class="vid"><button class="vid-thumb" type="button" data-yt="%s" aria-label="Play: %s">'
            '<span class="ph">Video</span><img src="https://i.ytimg.com/vi/%s/hqdefault.jpg" alt="" loading="lazy">'
            '<span class="play"><i></i></span></button><div class="vid-body"><b>%s</b><span class="ch">%s</span>'
            '<span class="nt">%s</span><a href="https://www.youtube.com/watch?v=%s" target="_blank" rel="noopener">Watch on YouTube ↗</a></div></div>'
            % (vid, title, vid, title, html.escape(v.get('channel', '')), html.escape(v.get('note', '')), vid))


def fill_videos(body):
    def rep(m):
        topic = m.group(1)
        vids = VIDEOS.get(topic, [])
        if not vids:
            return ''
        return '<div class="videos" data-topic="%s">%s</div>' % (topic, ''.join(video_card(v) for v in vids))
    return re.sub(r'<div class="videos" data-topic="([\w-]+)">\s*</div>', rep, body)


# ---------------------------------------------------------------- figures (collected for the gallery)
FIGURES = []
FIG_RE = re.compile(r'<figure class="fig"(?P<attrs>[^>]*)>(?P<inner>.*?)</figure>', re.S)


def tag_figures(page, body):
    n = [0]

    def rep(m):
        n[0] += 1
        name = '%s-figure-%d' % (slug(page['meta'].get('title', page['id'])), n[0])
        inner = m.group('inner')
        cap = re.search(r'<figcaption>(.*?)</figcaption>', inner, re.S)
        sec = None
        # nearest preceding section id
        before = body[:m.start()]
        sm = list(re.finditer(r'<section id="([^"]+)"', before))
        if sm:
            sec = sm[-1].group(1)
        FIGURES.append(dict(page=page['id'], name=name, inner=inner, sec=sec,
                            caption=strip_tags(cap.group(1)) if cap else ''))
        return '<figure class="fig" data-dl="%s"%s>%s</figure>' % (name, m.group('attrs'), inner)
    return FIG_RE.sub(rep, body)


# ---------------------------------------------------------------- layout
def nav_html(cur, root):
    out = []
    for group, items in NAV:
        out.append('<div class="nav-group"><p>%s</p>' % html.escape(group))
        for pid, path, _src, _t, num, tracked in items:
            p = BY_ID[pid]
            attrs = ' data-id="%s"' % pid if tracked else ''
            if pid == cur:
                attrs += ' aria-current="page"'
            out.append('<a href="%s%s"%s><span class="num">%s</span><span>%s</span><span class="done-mark" aria-hidden="true">✓</span></a>'
                       % (root, path, attrs, html.escape(num), html.escape(p['nav'])))
        out.append('</div>')
    return '\n'.join(out)


def pager_html(page, root):
    seq = [p for p in PAGES]
    i = seq.index(page)
    prev_p = seq[i - 1] if i > 0 else None
    next_p = seq[i + 1] if i + 1 < len(seq) else None
    parts = ['<nav class="pager" aria-label="Previous and next">']
    if prev_p:
        parts.append('<a class="prev" href="%s%s"><small>Previous</small>%s</a>' % (root, prev_p['out'], html.escape(prev_p['nav'])))
    else:
        parts.append('<span></span>')
    if next_p:
        parts.append('<a class="next" href="%s%s"><small>Next</small>%s</a>' % (root, next_p['out'], html.escape(next_p['nav'])))
    parts.append('</nav>')
    return ''.join(parts)


FX_DEFS = ('<svg id="fx-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">'
           '<defs><marker id="fx-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
           '<path class="fx-head" d="M0,0 L10,5 L0,10 z"/></marker></defs></svg>')


def layout(page, body, root):
    meta = page['meta']
    title = meta.get('title', page['nav'])
    doc_title = SITE_NAME if page['id'] == 'home' else '%s · %s' % (strip_tags(title), SITE_NAME)
    wide = meta.get('wide', False)
    scripts = ''.join('<script src="%s%s" defer></script>' % (root, s) for s in meta.get('scripts', []))
    head_block = ''
    if not meta.get('custom_head'):
        bits = []
        if meta.get('minutes'):
            bits.append('<span>%s min read</span>' % meta['minutes'])
        if page['tracked']:
            bits.append('<span>Tracked in your progress</span>')
        head_block = ('<header class="page-head"><p class="eyebrow">%s</p><h1>%s</h1><p class="lede">%s</p>%s</header>'
                      % (meta.get('eyebrow', ''), meta.get('h1', html.escape(title)), meta.get('lede', ''),
                         ('<div class="page-meta">%s</div>' % ''.join(bits)) if bits else ''))
    endcap = '<div class="endcap">'
    if page['tracked']:
        endcap += '<button class="donebtn" type="button">Mark this page complete</button>'
    endcap += pager_html(page, root) + '</div>'
    desc = strip_tags(meta.get('lede', ''))[:300]
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(doc_title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="{html.escape(doc_title)}">
<meta property="og:description" content="{html.escape(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%23151826'/%3E%3Cg fill='none' stroke='%23fff' stroke-width='1.6'%3E%3Ccircle cx='12' cy='6' r='2.2'/%3E%3Ccircle cx='6' cy='17' r='2.2'/%3E%3Ccircle cx='18' cy='17' r='2.2'/%3E%3Cpath d='M11 8 7 15M13 8l4 7M8.2 17h7.6'/%3E%3C/g%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Schibsted+Grotesk:wght@400;500;600;700;800;900&display=swap">
<link rel="stylesheet" href="{root}assets/styles.css">
<script>try{{var t=localStorage.getItem('aiam.theme');if(t)document.documentElement.setAttribute('data-theme',JSON.parse(t));}}catch(e){{}}</script>
</head>
<body data-root="{root}" data-page="{page['id']}" data-track="{','.join(TRACK)}">
<a class="skip-link" href="#content">Skip to content</a>
{FX_DEFS}
<div class="shell">
  <aside class="rail" aria-label="Course contents">
    <div class="rail-head">
      <a class="brand" href="{root}index.html"><span class="brand-mark">{BRAND_MARK}</span><span><span class="brand-name">{SITE_NAME}</span><span class="brand-sub">{SITE_SUB}</span></span></a>
      <div class="rail-tools">
        <button class="searchbtn" type="button" data-search-open>{ICON_SEARCH}<span>Search</span><kbd>/</kbd></button>
        <button class="iconbtn" type="button" data-theme-toggle aria-label="Switch theme"></button>
      </div>
    </div>
    <div class="rail-progress"><div class="rail-progress-top"><span>Pages completed</span><b id="pcount">0 / {len(TRACK)}</b></div><div class="meter"><i id="pbar"></i></div></div>
    <nav class="nav" aria-label="Course pages">
{nav_html(page['id'], root)}
    </nav>
  </aside>
  <div class="main">
    <div class="topbar">
      <button class="iconbtn" type="button" id="menu-btn" aria-label="Open contents">{ICON_MENU}</button>
      <span class="brand-name">{SITE_NAME}</span>
      <button class="iconbtn" type="button" data-search-open aria-label="Search">{ICON_SEARCH}</button>
      <button class="iconbtn" type="button" data-theme-toggle aria-label="Switch theme"></button>
    </div>
    <div class="page-wrap{' wide' if wide else ''}">
      <main class="article" id="content">
{head_block}
{body}
{endcap}
      </main>
      {'' if wide else '<aside class="toc" id="toc" aria-label="On this page"></aside>'}
    </div>
    <footer class="site-foot"><span>{FOOTER_LEFT}</span><span>{FOOTER_RIGHT}</span></footer>
  </div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" defer></script>
<script src="{root}assets/app.js" defer></script>
{scripts}
</body>
</html>
'''


# ---------------------------------------------------------------- generated blocks
def methods_table(root):
    rows = []
    for p in PAGES:
        if not p['id'].startswith('x-'):
            continue
        spec = dict(re.findall(r'<dt>(.*?)</dt>\s*<dd>(.*?)</dd>', p['body'], re.S))
        kind = 'Code' if p['group'].endswith('Code') else 'No/low-code'
        rows.append('<tr><td><a href="%s%s"><b>%s</b></a><br><span class="muted small">%s</span></td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (
            root, p['out'], html.escape(p['nav']), kind,
            strip_tags(spec.get('Skill level', '')), strip_tags(spec.get('Time to first agent', '')),
            strip_tags(spec.get('Best for', '')), strip_tags(spec.get('Runs where', '')), strip_tags(spec.get('Lock-in risk', ''))))
    return ('<div class="table-wrap"><table><thead><tr><th>Method</th><th>Skill level</th><th>Time to first agent</th><th>Best for</th><th>Runs where</th><th>Lock-in risk</th></tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table></div>')


def gallery_html(root):
    out = []
    groups = {}
    for f in FIGURES:
        groups.setdefault(f['page'], []).append(f)
    for p in PAGES:
        figs = groups.get(p['id'])
        if not figs or p['id'] == 'media':
            continue
        cat = 'module' if p['id'].startswith('m') and p['id'][1:].isdigit() else ('method' if p['id'].startswith('x-') else 'other')
        for f in figs:
            link = '%s%s%s' % (root, p['out'], ('#' + f['sec']) if f['sec'] else '')
            out.append('<figure class="fig" data-cat="%s" data-dl="%s">%s<p class="small" style="margin:6px 0 0"><a href="%s">From: %s</a></p></figure>'
                       % (cat, f['name'], f['inner'], link, html.escape(strip_tags(p['nav']))))
    return '<div class="gallery" id="gallery">%s</div>' % ''.join(out)


TOPIC_NAMES = {
    'llm-basics': 'How LLMs work', 'agents-intro': 'What AI agents are', 'agentic-patterns': 'Agentic design patterns',
    'prompting': 'Prompting and instructions', 'tool-calling': 'Tools and function calling', 'rag': 'RAG and knowledge',
    'memory': 'Memory and context', 'multi-agent': 'Multi-agent systems', 'mcp': 'Model Context Protocol (MCP)',
    'a2a': 'Agent2Agent (A2A)', 'evals': 'Evaluation', 'security': 'Security and guardrails', 'deployment': 'Deployment and LLMOps',
    'business': 'Business value and strategy', 'langgraph': 'LangGraph', 'crewai': 'CrewAI', 'autogen': 'Microsoft Agent Framework / AutoGen',
    'openai-sdk': 'OpenAI Agents SDK', 'claude-sdk': 'Claude Agent SDK and Claude Code', 'adk': 'Google ADK', 'llamaindex': 'LlamaIndex',
    'n8n': 'n8n and workflow automation', 'copilot-studio': 'Microsoft Copilot Studio', 'custom-gpt': 'Custom GPTs, Projects and Gems',
    'voice': 'Voice agents', 'computer-use': 'Computer-use and browser agents', 'enterprise': 'Enterprise agent platforms', 'chatbots': 'Chatbots',
}
TOPIC_GROUP = {
    'Concepts': ['llm-basics', 'agents-intro', 'agentic-patterns', 'prompting', 'tool-calling', 'rag', 'memory', 'multi-agent', 'mcp', 'a2a'],
    'Corporate': ['evals', 'security', 'deployment', 'business'],
    'Frameworks': ['langgraph', 'crewai', 'autogen', 'openai-sdk', 'claude-sdk', 'adk', 'llamaindex'],
    'No-code & platforms': ['n8n', 'copilot-studio', 'custom-gpt', 'enterprise', 'voice', 'computer-use', 'chatbots'],
}


def video_library():
    out = []
    for grp, keys in TOPIC_GROUP.items():
        for k in keys:
            vids = VIDEOS.get(k, [])
            if not vids:
                continue
            out.append('<div class="vid-section" data-group="%s" id="v-%s"><h3>%s <small>%d videos</small></h3><div class="videos">%s</div></div>'
                       % (html.escape(grp), k, html.escape(TOPIC_NAMES.get(k, k)), len(vids), ''.join(video_card(v) for v in vids)))
    return ''.join(out)


def counts():
    vids = {v['id'] for vs in VIDEOS.values() for v in vs}
    quizq = sum(p['body'].count('class="q"') for p in PAGES)
    words = sum(len(strip_tags(p['body']).split()) for p in PAGES)
    gloss = sum(p['body'].count('<dt id=') for p in PAGES if p['id'] == 'glossary')
    return {
        'modules': sum(1 for p in PAGES if re.match(r'm\d\d$', p['id'])),
        'methods': sum(1 for p in PAGES if p['id'].startswith('x-')),
        'capstones': BY_ID['capstones']['body'].count('class="capstone"'),
        'videos': len(vids), 'figures': len(FIGURES), 'quiz': quizq, 'glossary': gloss,
        'words': '%d,000' % round(words / 1000),
    }


# ---------------------------------------------------------------- build
def main():
    # remove only what this script generates, never anything else in the repository
    os.makedirs(OUT, exist_ok=True)
    for name in ('modules', 'methods', 'assets'):
        pth = os.path.join(OUT, name)
        if os.path.isdir(pth) and os.path.abspath(pth) != os.path.abspath(os.path.join(HERE, name)):
            shutil.rmtree(pth)
    for p in PAGES:
        f = os.path.join(OUT, p['out'])
        if os.path.exists(f):
            os.remove(f)

    # pass 1: prepare bodies (figures first so the gallery and counts know them)
    for p in PAGES:
        root = rel_root(p['out'])
        body = p['body'].replace('{{root}}', root)
        body = fill_videos(body)
        body = tag_figures(p, body)
        p['html_body'] = body

    c = counts()
    search = []
    for p in PAGES:
        root = rel_root(p['out'])
        body = p['html_body']
        body = body.replace('{{methods_table}}', methods_table(root))
        body = body.replace('{{gallery}}', gallery_html(root))
        body = body.replace('{{video_library}}', video_library())
        for k, v in c.items():
            body = body.replace('{{count:%s}}' % k, str(v))
        lede = p['meta'].get('lede', '')
        for k, v in c.items():
            lede = lede.replace('{{count:%s}}' % k, str(v))
        p['meta']['lede'] = lede
        write(os.path.join(OUT, p['out']), layout(p, body, root))

        # search index: one entry per section, plus glossary terms
        title = strip_tags(p['meta'].get('title', p['nav']))
        secs = re.findall(r'<section id="([^"]+)"[^>]*>\s*<h2>(.*?)</h2>(.*?)(?=<section id=|\Z)', p['body'], re.S)
        if not secs:
            search.append({'p': title, 's': title, 'u': p['out'], 'x': strip_tags(p['body'])[:1200]})
        for sid, h2, rest in secs:
            search.append({'p': title, 's': strip_tags(h2), 'u': p['out'] + '#' + sid, 'x': strip_tags(rest)[:1400]})
        if p['id'] == 'glossary':
            for tid, term, dd in re.findall(r'<dt id="([^"]+)">(.*?)</dt>\s*<dd>(.*?)</dd>', p['body'], re.S):
                search.append({'p': 'Glossary', 's': strip_tags(term), 'u': p['out'] + '#' + tid, 'x': strip_tags(dd)[:400]})
    write(os.path.join(OUT, 'assets', 'search-index.js'), 'window.SEARCH_INDEX=' + json.dumps(search, ensure_ascii=False, separators=(',', ':')) + ';\n')

    # static assets
    for name in os.listdir(os.path.join(HERE, 'assets')):
        shutil.copy(os.path.join(HERE, 'assets', name), os.path.join(OUT, 'assets', name))
    write(os.path.join(OUT, '.nojekyll'), '')
    write(os.path.join(OUT, '404.html'), '<!doctype html><meta charset="utf-8"><title>Page not found</title><p>Page not found. <a id="h" href="./index.html">Go to the course home page</a></p><script>var s=location.pathname.split("/").filter(Boolean);var base=location.hostname.endsWith("github.io")&&s.length?"/"+s[0]+"/":"/";document.getElementById("h").href=base+"index.html";location.replace(base+"index.html");</script>')
    print('Built %d pages into %s' % (len(PAGES), OUT))
    print(json.dumps(c))


if __name__ == '__main__':
    main()
