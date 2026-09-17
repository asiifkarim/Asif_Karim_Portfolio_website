# Asif Karim Portfolio

A frontend-only static portfolio positioning Asif Karim as a Generative AI and Agentic AI Engineer specializing in LangGraph multi-agent systems, RAG pipelines, and production LLM applications. It uses the existing HTML/CSS design, loads public repositories directly from GitHub, renders skills from local data, and sends contact messages through Formspree.

## Features

- Responsive HTML/CSS/JavaScript pages
- Dark/light theme toggle and existing animations
- Live public repositories from GitHub
- Static skills data in `frontend/src/js/skills.js`
- Formspree contact form
- No backend, database, build step, admin panel, or authentication

## Local Preview

From the repository root:

```bash
cd frontend/src
python -m http.server 3000
```

Open <http://localhost:3000>.

Use a local HTTP server rather than opening the HTML files directly so browser fetch and asset behavior matches deployment.

## Configure Contact Form

1. Create a free form at <https://formspree.io>.
2. Copy the form endpoint provided by Formspree.
3. Replace `REPLACE_WITH_YOUR_FORM_ID` in `frontend/src/contact.html` with that endpoint ID.
4. Submit a test message after deploying.

The form currently uses:

```html
action="https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID"
```

Until this placeholder is replaced, the contact form is not connected to an inbox.

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, select **Add New Project** and import the repository.
3. Set **Framework Preset** to `Other`.
4. Set **Root Directory** to `frontend/src`.
5. Leave the build command empty. There is no build step.
6. Deploy.

The included `vercel.json` also supports deploying from the repository root with `frontend/src` as the output directory. Choose one approach, not both:

- Recommended dashboard setup: Root Directory `frontend/src`, no build command.
- Repository-root setup: keep the root directory as `.`, and let `vercel.json` set `outputDirectory` to `frontend/src`.

No Render, Railway, Docker, Python, environment variables, database, or API URL is required.

## Project Structure

```text
portfolio/
├── frontend/
│   ├── src/
│   │   ├── index.html
│   │   ├── about.html
│   │   ├── projects.html
│   │   ├── services.html
│   │   ├── contact.html
│   │   ├── css/style.css
│   │   ├── images/
│   │   └── js/
│   │       ├── main.js
│   │       └── skills.js
│   └── public/                 # Legacy duplicate assets; Vercel deployment uses src
├── LICENSE
├── README.md
└── vercel.json
```

Projects are fetched from `https://api.github.com/users/asiifkarim/repos?sort=updated` at runtime. GitHub API rate limits can affect unauthenticated requests, but no GitHub token is needed for this public portfolio.
