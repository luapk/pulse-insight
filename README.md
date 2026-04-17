# Pulse

**Social intelligence for creative directors. Signal, not noise.**

Pulse is a real-time social trend analyst tuned for advertising and marketing teams. It scans what's actually trending across TikTok, Instagram, YouTube, and X, then maps opportunities to a specific brand — producing sign-off-ready briefs at an Executive Creative Director standard.

Built on Claude Sonnet 4 with live web search. Outputs are rendered as designed information graphics with radar charts, velocity bars, timeline visualisations, and craft-grade executional copy.

---

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/pulse&env=ANTHROPIC_API_KEY&envDescription=Your%20Anthropic%20API%20key&envLink=https://console.anthropic.com/)

Replace `YOUR_USERNAME` with your GitHub username after pushing this repo.

---

## What it does

- **Executive Summary** — the read, the move, the risk, plus a headline stat
- **Platform Fit** — radar chart scoring TikTok, Instagram, YouTube, X against audience fit, format fit, velocity, and saturation risk
- **Cultural Tensions** — the portable insights underneath surface trends
- **Trends Worth Riding** — with velocity tags, decay estimates, and earned/creator/paid entry modes
- **Whitespace Map** — where the category is silent and your brand could plant a flag
- **Competitive Read** — what the top 3 competitors are doing, and the gap
- **Cultural Calendar** — timeline of the next 12 weeks with lead-time flags
- **Rising Creators** — with growth metrics and brand-safety notes
- **Executional Starters** — D&AD/Cannes-standard routes with rationales
- **This Week's Moves** — tactical actions with owners and time estimates
- **PDF Export** — designed one-pager you can drop into a deck
- **PowerPoint Export** — tick the ideas, trends, creators and routes you want, hit Export Deck, and get a designed .pptx you can present to clients

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your Anthropic API key
cp .env.example .env.local
# Edit .env.local and paste your key from https://console.anthropic.com/

# 3. Run the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

For the serverless API route to work in local dev, install the Vercel CLI and use `vercel dev` instead of `npm run dev`:

```bash
npm i -g vercel
vercel dev
```

---

## Deploy to Vercel via GitHub

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pulse.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `pulse` GitHub repo
3. Vercel auto-detects Vite — leave build settings as default
4. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | Your key from [console.anthropic.com](https://console.anthropic.com/) |

5. Click **Deploy**

Your app will be live at `https://pulse-YOUR-USERNAME.vercel.app` within ~60 seconds.

### 3. (Optional) Add a custom domain

In the Vercel dashboard, go to **Settings → Domains** and add your domain. Vercel handles SSL automatically.

---

## How it works

### Architecture

```
┌─────────────────────┐  stream  ┌──────────────────────┐  stream  ┌─────────────────┐
│  React app (Vite)   │◀─────────│ /api/anthropic       │◀─────────│  Anthropic API  │
│  PulseApp.jsx       │  SSE     │ Vercel Edge Function │  SSE     │  Claude Sonnet 4│
└─────────────────────┘          └──────────────────────┘          └─────────────────┘
         │                                  │
         │                                  └─ Uses ANTHROPIC_API_KEY env var
         │                                     (never exposed to browser)
         │
         └─ Streams SSE events, accumulates text, parses as JSON on completion,
            renders as designed infographic
```

The frontend never sees your API key. All requests go through the Vercel Edge Function at `/api/anthropic`, which adds the key server-side and proxies to Anthropic.

**Streaming, not buffering.** The Edge Function passes through the Anthropic streaming SSE response as it arrives. This is deliberate — it keeps the HTTP connection alive during long briefs (which can run 60-90s), bypassing Vercel's idle timeout. You'll see live progress updates while Claude works: "Running search 1...", "Running search 2...", "Writing brief · 1,240 chars so far...".

### The PULSE system prompt

The system prompt is embedded in `src/PulseApp.jsx` as `SYSTEM_PROMPT`. It enforces:

- **Structured JSON output** — the frontend parses this into designed components
- **D&AD/Cannes copywriting standards** — for the executional starters section
- **Calibrated confidence** — flags thin data rather than bluffing
- **Whitespace mapping** — what competitors aren't doing
- **Brand-safety flags** — surfaces controversy around sounds, creators, hashtags

Edit `SYSTEM_PROMPT` in `src/PulseApp.jsx` to tune the output behaviour.

### PDF export

Uses `html2canvas` to rasterise the brief and `jsPDF` to paginate across A4 pages. The export process:

1. Temporarily neutralises `backdrop-filter` (glass blur) for cleaner capture
2. Rasterises at 2× DPI
3. Paginates with 8mm margins
4. Adds a page footer with brand, date, and page number
5. Downloads as `pulse-brief-[brand]-[date].pdf`

---

## Project structure

```
pulse/
├── api/
│   └── anthropic.js          # Vercel Edge Function (API proxy)
├── public/
│   └── favicon.svg
├── src/
│   ├── PulseApp.jsx          # Main app — all logic, UI, system prompt
│   ├── main.jsx              # React entry
│   └── index.css             # Tailwind + animations
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
├── vite.config.js
└── .env.example
```

Single-file React app (`PulseApp.jsx`) by design — keeps the deployable unit small and the customisation surface obvious.

---

## Costs

Each brief typically uses:

- **1 Claude Sonnet 4 call** (~5–8K input tokens, ~3–6K output tokens)
- **5–10 web searches** (included in Claude API pricing)

At current Anthropic pricing, a brief costs roughly **$0.10–0.30** in API usage. Vercel's hobby tier covers the hosting free.

---

## Customisation

### Change the brand starter prompts

Edit the `quickPrompts` array in `src/PulseApp.jsx` (around line 260).

### Change the design tokens

The colour palette lives in inline styles within `PulseApp.jsx`. Key tokens:

- Background gradient: `#fef3e8 → #fde8f1 → #e8f0fe → #e8fdf5` (line ~370)
- Ambient glow orbs: peach `#ffd4a8`, blue `#b8e0ff`, pink `#ffc8e0`
- Platform colours: TikTok `#ff0050`, Instagram `#e1306c`, YouTube `#ff0000`, X `#1c1917`

### Change the model

In `sendMessage()` (around line 295), the model is hardcoded to `claude-sonnet-4-20250514`. Swap for any available Claude model — Opus for deeper analysis, Haiku for faster/cheaper runs.

### Tighten the system prompt

The `SYSTEM_PROMPT` constant (top of `PulseApp.jsx`) is verbose by design — it enforces a strict JSON schema and the copywriting craft standard. Edit it to change output structure, add sections, or inject brand-specific context.

---

## Known limitations

- **Brief generation time** — briefs take 45–90 seconds typical. The app streams the response live from the API so Vercel's idle timeout doesn't apply — the connection stays alive throughout. You'll see progress updates ("Running search 3...", "Writing brief · 1,240 chars so far...") while it works.
- **PDF capture** — glass morphism doesn't print; the PDF substitutes solid white backgrounds (which actually reads better on paper).
- **Single-user** — no auth, no history. Every session starts fresh. If you need multi-user or saved briefs, add a database layer (Supabase/Neon work well with Vercel).

---

## Tech stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3.4**
- **Recharts** for data viz
- **Lucide** for icons
- **jsPDF** + **html2canvas** for PDF export
- **Anthropic Claude Sonnet 4** with web search
- **Vercel Edge Functions**

---

## Licence

Private. Configure as needed.
