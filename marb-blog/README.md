## MARB Blog (Next.js)

This is a tiny Next.js 14 app that hosts a **single-page blog-style writeup**
for the Multi-Step Agent Retrieval Benchmark (MARB) you built in the main repo.

It lives alongside the Python benchmark so you can:

- Link to a clean, readable explanation of what MARB is.
- Share it with reviewers or teammates without exposing the whole codebase.
- Iterate on the narrative independently of the core benchmark code.

---

## Getting started

From the `marb-blog` directory:

```bash
cd marb-blog
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser to view the page.

The app uses:

- Next.js 14 (app router)
- TypeScript
- A simple handcrafted CSS theme (no Tailwind or UI framework)

---

## Structure

- `app/layout.tsx` — root layout, metadata, and global styles import.
- `app/page.tsx` — the actual MARB blog page (hero, sections, code snippet).
- `app/globals.css` — minimal dark theme styling.
- `package.json`, `tsconfig.json`, `next.config.mjs` — standard Next.js boilerplate.

You can edit `app/page.tsx` to tweak copy, add sections, or drop in charts or result tables
from your experiments (for example, screenshots of MARB runs comparing Exa vs other search APIs).


