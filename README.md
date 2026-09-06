# TruthLens AI

Evidence-grounded claim verification and a retrieval-augmented AI assistant. Submit a
claim, TruthLens searches its knowledge base, reasons over what it finds with an LLM, and
returns a verdict — **True / False / Misleading / Unverified** — with a confidence score
and the sources behind it, usually in under two seconds.

This is a ground-up rewrite of the original codebase, re-architected specifically to
deploy fast and free on Render, Railway, or Vercel.

---

## ⚠️ Before you do anything else: rotate your database password

Your original `backend/Database/db.py` had a **live Neon Postgres connection string —
including the username and password — committed directly in the source code**. If that
code was ever pushed to a GitHub repo (public or private), treat that password as
compromised.

**Go to your [Neon console](https://console.neon.tech) and reset that database's
password now.** This rewrite doesn't use that database at all (see below), so nothing
here depends on it — this is just about closing the hole in the old code.

---

## What changed, and why

| | Before | Now | Why |
|---|---|---|---|
| LLM | Ollama (local) / Gemini / OpenRouter | **Groq** (`openai/gpt-oss-120b`) | Groq runs on custom LPU hardware — noticeably faster responses than GPU-hosted APIs. This is the biggest lever for "make my AI fast." Ollama in particular can't run on Render/Railway/Vercel free tiers at all — no GPU, no persistent model cache. |
| Retrieval | ChromaDB + sentence-transformers + torch | **BM25** (`rank-bm25`) | The old stack is 1-2GB+ of dependencies, downloads model weights on boot, and easily exceeds a free instance's RAM. BM25 is a keyword-ranking algorithm with zero model weights — it installs in seconds and searches in milliseconds. |
| Database | SQLAlchemy + Postgres (Neon) | **Atomic JSON files** | No database to provision, no connection string to leak, nothing to configure before it runs. Trade-off noted below. |
| Frontend data | Drizzle + Neon + Clerk auth | **None — talks only to the FastAPI backend** | Removes required signup for Clerk and a second database, cutting setup down to one API key. |
| Chat | Non-streaming | **Streaming (SSE-style)** | Tokens render as they're generated instead of after a multi-second wait. |
| Theme | Grayscale glass UI | **"Wire Desk"** — see below | A visual identity built around the product instead of generic AI-dashboard defaults. |

I also fixed a real bug from the original verification pipeline: it detected "questions"
with `claim.startswith(word)`, which misfires on claims like *"Israel is a country..."*
(starts with "is"). The rewrite checks the actual first word instead.

### Design decisions worth knowing about

- **No auth.** The original used Clerk. I dropped it to minimize required setup (no
  signup, no extra env vars) — the whole app is open. If you want accounts later, that's
  a deliberate follow-up, not an oversight.
- **No per-user data isolation.** Chat history and verification history are stored
  backend-side with no concept of "users." The chat sidebar only ever loads session IDs
  the browser itself created (via `localStorage`), so visitors don't see each other's
  conversations in the UI — but there's no auth enforcing that at the API layer. Fine for
  a personal project or demo; add auth before treating this as multi-tenant.
- **Storage is ephemeral on most free hosting.** JSON files on local disk survive
  restarts but are usually wiped on redeploy (Render/Railway free tiers). If you need
  durable history, swap `storage.py` for a real database — every service calls it through
  one narrow interface, so it's a contained change.
- **The knowledge base ships with ~20 seeded trivia/science facts** (`backend/seed_knowledge.json`)
  so Verify has something to check claims against immediately. Upload your own PDFs/TXT/MD
  on the Knowledge Base page — it's indexed the moment it's uploaded.

---

## The new theme: "Wire Desk"

Instead of another dark-mode cyan/violet AI dashboard, the UI leans into what the product
actually does: a nighttime newsroom desk crossed with an optical instrument. Deep ink-navy
surfaces, a brass dial accent for interactive elements, and four verdict colors that carry
real meaning (verified teal, false red, misleading amber, unverified grey) instead of
decoration. The logo is a hand-built six-blade camera iris — bringing a claim "into focus"
is the literal interaction on the Verify page: submit a claim, watch it scan, get a
stamped verdict.

Fonts are self-hosted (`@fontsource`, not a Google Fonts runtime dependency): **Archivo**
for display/headings, **Inter** for body text, **IBM Plex Mono** for genuinely tabular
data (confidence numbers, timestamps, source tags).

---

## Architecture

```
truthlens/
├── backend/          FastAPI + Groq + BM25, deploy to Render or Railway
│   ├── main.py                  App entrypoint, CORS, rate limiting, middleware
│   ├── config.py                All settings, read from environment variables
│   ├── knowledge_base.py        BM25 retrieval engine
│   ├── llm.py                   Async Groq client (chat + streaming)
│   ├── services/                verification.py, chat.py, documents.py, history.py
│   ├── routers/                 verify.py, chat.py, documents.py, history.py
│   ├── seed_knowledge.json      Starter reference facts
│   └── Dockerfile, render.yaml (at repo root), railway.json, Procfile
│
└── frontend/         Next.js 16 + React 19 + Tailwind v4, deploy to Vercel
    ├── app/                     /, /verify, /chat, /knowledge, /history
    ├── components/              brand, layout, home, verify, chat, knowledge, history, ui
    └── lib/                     api.ts (typed client), types.ts, utils.ts, hooks.ts
```

The frontend and backend are fully decoupled — the frontend only ever talks to the
backend over HTTP via `NEXT_PUBLIC_API_URL`. This is why they deploy to different
platforms: Vercel is excellent for Next.js but doesn't suit a Python process holding a
BM25 index and JSON files in memory across requests; Render/Railway are built exactly for
that kind of always-on service.

---

## Run it locally

**Requirements:** Python 3.12+, Node.js 20+, and a free [Groq API key](https://console.groq.com/keys).

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# open .env and paste in your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs, or `http://localhost:8000/api/health`
for a quick check.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local     # defaults already point at localhost:8000
npm run dev
```

Visit `http://localhost:3000`.

### Or run the backend with Docker

```bash
cp backend/.env.example backend/.env   # add your GROQ_API_KEY
docker compose up --build
```

---

## Deploy it

### 1. Push to GitHub

```bash
cd truthlens
git init
git add .
git commit -m "TruthLens AI - rewrite"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Backend → Render (recommended — render.yaml is already set up)

1. On [Render](https://dashboard.render.com), click **New +** → **Blueprint**, and point
   it at your repo. Render reads `render.yaml` at the repo root automatically.
2. When prompted, paste your `GROQ_API_KEY` (marked `sync: false` so it's asked for
   interactively rather than committed).
3. Deploy. Note the resulting URL, e.g. `https://truthlens-backend.onrender.com`.

*(Render's free web services spin down after inactivity and take ~30-60s to wake back up
on the next request — normal for the free tier, not a bug.)*

**Backend → Railway instead:** New Project → Deploy from GitHub repo → set the service's
**Root Directory** to `backend` → Railway will detect `railway.json` and build the
included `Dockerfile`. Add the same environment variables listed below in the service's
Variables tab.

### 3. Frontend → Vercel

1. On [Vercel](https://vercel.com/new), import the same repo.
2. Set **Root Directory** to `frontend`.
3. Add an environment variable: `NEXT_PUBLIC_API_URL` = your Render/Railway backend URL
   from step 2 (no trailing slash).
4. Deploy.

### 4. Connect them

Copy your live Vercel URL, go back to your backend's environment variables
(Render/Railway dashboard), and set `FRONTEND_ORIGINS` to that URL (comma-separate if you
also want to allow a custom domain). Redeploy the backend so CORS picks it up.

---

## Environment variables

### `backend/.env`

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | **Yes** | — | Free at [console.groq.com/keys](https://console.groq.com/keys) |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | `openai/gpt-oss-20b` is smaller/faster if you want to trade a little quality for speed |
| `GROQ_REASONING_EFFORT` | No | `low` | `low` / `medium` / `high` — higher reasons more carefully, a bit slower |
| `FRONTEND_ORIGINS` | Recommended | `http://localhost:3000` | Comma-separated list of allowed origins (CORS) |
| `RATE_LIMIT_VERIFY` / `RATE_LIMIT_CHAT` / `RATE_LIMIT_UPLOAD` | No | `20/minute` / `30/minute` / `10/minute` | Per-IP limits, protect your Groq quota |
| `MAX_UPLOAD_MB` | No | `15` | Max document upload size |

### `frontend/.env.local`

| Variable | Required | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:8000` |

---

## Execution command reference

```bash
# Backend — dev (auto-reload)
uvicorn main:app --reload --port 8000

# Backend — production (what the Dockerfile/render.yaml run)
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2

# Frontend — dev
npm run dev

# Frontend — production build + start
npm run build && npm start

# Frontend — lint
npm run lint

# Local full stack via Docker (backend only; run frontend with npm separately)
docker compose up --build
```

---

## Tested before delivery

I actually ran this, not just wrote it:

- **Backend:** installed dependencies, booted the server, and curl-tested every endpoint —
  claim verification, chat + streaming, document upload/delete/list, history, and rate
  limiting (confirmed it returns `429` on the 21st request within a minute, as configured).
  Confirmed graceful, non-crashing errors when `GROQ_API_KEY` is unset.
- **Frontend:** `npm run build` and `npm run lint` both pass clean (0 errors, 0 warnings) on
  Next.js 16 / React 19 / Tailwind v4, and the production server serves all five routes
  with correct titles.
- **What I couldn't test here:** the actual Groq responses (I don't have your API key) and
  a real browser render (this sandbox has no GUI/browser). Both are standard,
  well-trodden paths — but give the verdicts and chat replies a look once you're deployed,
  the way you would with any new AI integration.
