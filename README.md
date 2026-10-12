# AI Agents for Management

A free, open course website on AI agents for business students and managers: what agents are,
every way to build one, and how to take one safely into a company.

- 13 tutorial modules in three levels (Foundations, Building, Corporate)
- 15 build-method pages, each building the same "Meridian Deal Desk" agent
- An interactive concept map of every way to build an agent
- A method chooser and a side-by-side comparison of all 15 methods
- A chatbot page with a live in-browser helpdesk bot (rules, retrieval and agentic modes) and a build-your-own-from-FAQ tool
- An Agent Lab: a step-through simulator plus a live agent that runs on your own API key
- 12 capstone projects with an Agent Design Canvas, rubric and demo-day guide
- A media library: 108 verified videos and 60 original infographics (downloadable as PNG)
- Glossary (86 terms), resources library, quizzes on every module and method page, site search, progress tracking, light and dark themes

Everything is static HTML, CSS and JavaScript. No server, no database, no build step needed to host it.

## Publish on GitHub Pages (5 minutes)

1. Create a new public repository on GitHub, for example `ai-agents`.
2. Upload **everything in this folder** to the repository root (drag and drop the files and folders in the GitHub web
   page, or use `git push`). Keep the hidden `.nojekyll` file.
3. In the repository go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**,
   branch **main**, folder **/ (root)**, then **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/ai-agents/`.

With git:

```bash
cd ai-agents-for-management
git init && git add . && git commit -m "AI Agents for Management course site"
git branch -M main
git remote add origin https://github.com/<your-username>/ai-agents.git
git push -u origin main
```

## Editing the content

The pages are generated from fragments in `src/content/` so that the navigation, search, video library,
infographics gallery and methods comparison table always stay in sync.

```
src/
  build.py              the generator (Python 3, standard library only)
  content/modules/      the 13 tutorial modules
  content/methods/      the 15 build-method pages
  content/pages/        home, concept map, roadmap, chooser, chatbots, lab, capstones, media, glossary, resources
  assets/               styles.css and the page scripts (app, mindmap, chooser, lab, chatbot, media)
  data/videos.json      the verified video list, grouped by topic
  AUTHORING-GUIDE.md    markup components and writing rules for adding or editing pages
```

To change something: edit the fragment, then from the repository root run

```bash
python3 src/build.py
```

and commit the regenerated `.html` files. To add a page, write a fragment following `AUTHORING-GUIDE.md` and add
one line to the `NAV` list at the top of `src/build.py`.

## Notes

- **Live agent in the Agent Lab.** The API key is held only in page memory and sent directly from the visitor's
  browser to the chosen provider. Tell students to use a personal key with a low spend limit.
- **Currency.** Product names, features and prices in this field change monthly. Content was reviewed in
  October 2026; each page links the official docs. Re-check the videos (`src/data/videos.json`) each semester.
- **Licence.** The text and diagrams are original to this course. Videos are embedded from their creators' YouTube
  channels and remain theirs.
