# Video library verification report

Generated 2026-10-12. Every entry in `videos.json` was checked in this session against YouTube's oEmbed endpoint (`/oembed?url=...&format=json`). Titles and channel names are copied from the oEmbed `title` and `author_name` fields.

**Totals:** 28 topic keys, 115 entries, 108 unique videos (some videos sit under two keys).

## Verified count per key

| Key | Verified | Channels |
|---|---|---|
| llm-basics | 6 | 3Blue1Brown, Andrej Karpathy, IBM Technology |
| agents-intro | 5 | AI Engineer, Anthropic, DeepLearningAI, IBM Technology, Y Combinator |
| agentic-patterns | 4 | Amazon Web Services, CodeCraft Academy, IBM Technology, Sequoia Capital |
| prompting | 3 | Anthropic, IBM Technology |
| tool-calling | 3 | IBM Technology |
| rag | 4 | DeepLearningAI, IBM Technology, freeCodeCamp.org |
| memory | 5 | DeepLearningAI, Google Cloud Tech, IBM Technology, LangChain, OpenAI |
| multi-agent | 4 | DeepLearningAI, Google Cloud Tech, IBM Technology |
| mcp | 4 | AI Engineer, Fireship, IBM Technology |
| a2a | 4 | Cloud With Raj, DataStax, DeepLearningAI, Google Cloud Tech |
| evals | 4 | AI Engineer, Data Science Dojo, Hamel Husain, Lenny's Podcast |
| security | 4 | Alice (Formerly: ActiveFence), Google for Developers, KodeKloud, Simon Willison |
| deployment | 4 | AWS Developers, AWS Events, Google Cloud Tech, LangChain |
| business | 5 | Microsoft, Salesforce, Sequoia Capital, Y Combinator |
| langgraph | 3 | LangChain, freeCodeCamp.org |
| crewai | 4 | AI Engineer, DeepLearningAI, aiwithbrandon |
| autogen | 4 | Microsoft Developer, Microsoft Reactor, The AI Show, The Linux Foundation |
| openai-sdk | 4 | James Briggs, OpenAI |
| claude-sdk | 3 | AI Engineer, Anthropic |
| adk | 4 | Google Cloud Tech, Google for Developers, KodeKloud, aiwithbrandon |
| llamaindex | 4 | AI Engineer, DeepLearningAI, LlamaIndex, Siddhardhan |
| n8n | 3 | Kevin Stratvert, Nate Herk | AI Automation, n8n |
| copilot-studio | 4 | Anders Jensen, Lisa Crosbie, Microsoft Community Learning |
| custom-gpt | 5 | Anders Jensen, Anthropic, Kevin Stratvert, OpenAI, Stewart Gauld |
| voice | 4 | Bo Sar, DeepLearningAI, ElevenLabs, Sandeep Kaistha | Flipbytes |
| computer-use | 4 | Anthropic, OpenAI, Red Hat Developer |
| enterprise | 5 | AWS Events, Google Cloud Tech, Salesforce, Salesforce Support, ServiceNow Documentation |
| chatbots | 5 | AI Product Builders, Avra, Google Cloud, Google Cloud Tech, Visual Studio Code |

## Thin or weaker keys

- **prompting, tool-calling, langgraph, claude-sdk, n8n**: 3 each. The videos are good, but more could be added. tool-calling reuses the IBM MCP-vs-API video, and langgraph reuses LangChain's context-engineering talk.
- **claude-sdk**: only one video is specifically about the Claude Agent SDK (the AI Engineer workshop with Anthropic's Thariq Shihipar). The other two are official Anthropic Claude Code videos.
- **autogen**: there is little official Microsoft Agent Framework intro material. The list uses Microsoft Developer and Microsoft Reactor sessions, the Linux Foundation AutoGen talk and an AI Show segment. Nothing in the list is from Microsoft Research.
- **voice**: one video is official (ElevenLabs) and one comes from a course provider (DeepLearning.AI). Vapi and OpenAI Realtime are covered only by independent creators.
- **security**: Simon Willison and Google for Developers are strong. The OWASP episode is hosted on a vendor podcast channel (Alice, formerly ActiveFence).
- **chatbots**: a mix of official (VS Code, Google Cloud) and small independent channels (AI Product Builders, Avra).
- **business**: Pascal Bornet (Microsoft channel) and the Salesforce Dreamforce video are vendor-produced, so frame them as such in class.

## Corrections to the candidate list supplied

- `wjZofJX0v4M` exists. Its current title is **"Transformers, the tech behind LLMs | Deep Learning Chapter 5"** (3Blue1Brown), not "But what is a GPT?".
- `sal78ACtGTc` is on **Sequoia Capital**, titled "What's next for AI agentic workflows ft. Andrew Ng of AI Fund".
- `kQmXtrmQ5Zg` is on the **AI Engineer** channel, not Anthropic's.
- The other supplied candidates matched as expected: zjkBMFhNj_g, 7xTGNNLPyMI, LPZh9BOjkQs, F8NKVhkZZWI and T-D1OfcDW1M.

## Candidates checked and excluded

- `ncbo3bSGPI0` ("What are AI Guardrails?"): oEmbed returned an error, so it was not included.
- `8oHd2PuQjcI` (Sequoia AI Ascent 2025 keynote): a re-upload by "Tech Stuff", not the official Sequoia channel.
- `DSdyqPzdlQU` (Harrison Chase LangGraph talk): a re-upload by a third-party channel.
- `F-hsQROzSms` ("How we built our multi-agent research system"): uploaded by a small third-party channel, not Anthropic.

## Caveat
oEmbed confirms that a video exists and is embeddable, with the stated title and channel. It does not confirm video length, quality or region availability. Titles can change later, so re-run the check before each semester.
