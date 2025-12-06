![exa](https://github.com/user-attachments/assets/3248bc00-1e91-4c2e-a054-863daf315b26)
## Multi-Step Agent Retrieval Benchmark (MARB)

This repo contains a small, extensible benchmark to compare web search APIs in the context of **LLM agents** solving realistic, multi-step software tasks.

Instead of testing generic embedding quality (like MTEB), MARB focuses on a narrow but important vertical:
agents that use web search to complete coding and infra workflows. Each task requires several hops of reasoning, such as:

- **“Find a Python library for OCR, read the docs, and write code to extract text from PDFs.”**
- **“Find recent best practices for Dockerfiles and optimize this example file.”**

The core question: **“If I plug Exa into my agent instead of a generic web search API (or no search at all), do I solve more multi-step tasks end-to-end?”**

---

## What this benchmark measures

- **Task success rate**: For each provider, what percentage of multi-step tasks are solved by an agent?
- **Impact of search**:
  - **No search** (agent relies only on its pretraining).
  - **Generic web search** (e.g., SerpAPI / Google, Brave, Parallel, or other APIs).
  - **Exa search** (optimized for technical content).

Why this is useful for Exa:

- Many customers care about **agentic workflows**, not just single-turn Q&A.
- MARB directly tests “model → search → model” loops where high-quality technical results matter (docs, GitHub issues, blog posts).
- The framework is **API‑agnostic**: you can plug in Exa and other search providers and compare their effect on agent success.

---

## Quick start

### 1. Install dependencies

Create a virtualenv (optional but recommended) and install requirements:

```bash
cd exa-benchmarking
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure providers

Copy the example config and fill in your API keys:

```bash
cp config/providers.example.yaml config/providers.yaml
```

Then edit `config/providers.yaml` and add your credentials (you can keep or remove providers you don't use):

```yaml
providers:
  - name: exa
    type: exa
    api_key_env: EXA_API_KEY
    # Optional: base_url, top_k, extra parameters

  - name: parallel
    type: parallel
    api_key_env: PARALLEL_API_KEY
    # Parallel AI Search API

  - name: tavily
    type: tavily
    api_key_env: TAVILY_API_KEY
    # Tavily Search API

  - name: serpapi
    type: generic_json_http
    api_key_env: SERPAPI_API_KEY
    # SerpAPI (Google results)

  - name: brave
    type: generic_json_http
    api_key_env: BRAVE_API_KEY
    # Brave Search API (note: can be rate-limited on free tiers)

  # Optional / legacy:
  # - name: bing
  #   type: generic_json_http
  #   api_key_env: BING_API_KEY
  #   # Bing Search API is being retired in Aug 2025 – see Microsoft lifecycle docs.
```

You can either **use a `.env` file** (recommended) or export keys manually.

Create a `.env` file at the repo root:

```bash
EXA_API_KEY="..."
GEMINI_API_KEY="..."
PARALLEL_API_KEY="..."
BRAVE_API_KEY="..."
SERPAPI_API_KEY="..."
TAVILY_API_KEY="..."
# BING_API_KEY="..."  # only if you still use Bing
```

Thanks to `python-dotenv`, these are loaded automatically by the CLI.

Or export your keys in the shell before running:

```bash
export EXA_API_KEY="..."
export GEMINI_API_KEY="..."
export PARALLEL_API_KEY="..."
export BRAVE_API_KEY="..."
export SERPAPI_API_KEY="..."
# export BING_API_KEY="..."
```

### 3. Run MARB (providers run in parallel)

The main comparison is between:

- `none` (no web search),
- `exa` (Exa search),
- and any other configured providers (e.g., `serpapi`, `parallel`, optionally `brave` if you have quota).

Run the benchmark (without Brave to avoid free-tier rate limits):

```bash
python -m exa_benchmark.cli \
  --provider none \
  --provider exa \
  --provider parallel \
  --provider serpapi \
  --provider tavily \
  --tasks marb_tasks
```

This will:

- Load a small set of **multi-step tasks** from `marb_tasks.jsonl`.
- For each provider, run a simple two-step agent loop **in parallel**:
  - The agent first asks the model for search queries.
  - It then runs those queries through the chosen search API.
  - Finally, it asks the model to solve the task using the retrieved docs.
- While it runs, you&apos;ll see one progress bar per provider (e.g. `Provider=exa`,
  `Provider=serpapi`, etc.), all advancing at the same time.
- Compute **task success rate** and **wall‑clock runtime (seconds)** per provider based
  on automatic heuristics (e.g., checking for expected libraries or config snippets in
  the answer).

At the end, you&apos;ll get a summary table like:

```text
Provider        Agent                Solved     Total      Success%   Time (s)
----------------------------------------------------------------------------
none            simple_llm_agent     6          8          75.0       170.3
serpapi         simple_llm_agent     5          8          62.5       198.4
exa             simple_llm_agent     7          8          87.5       189.1
parallel        simple_llm_agent     6          8          75.0       210.6
tavily          simple_llm_agent     6          8          75.0       205.2
```

Numbers above are illustrative; your results will vary depending on keys, rate limits,
and model updates.

---

## Repo structure

- `exa_benchmark/`
  - `clients/`
    - `base.py` — abstract `SearchClient` interface.
    - `exa_client.py` — concrete client for the Exa search API.
    - `generic_http_client.py` — simple configurable HTTP client for other search APIs.
  - `agents/`
    - `base.py` — `AgentTask` definition and `Agent` protocol.
    - `simple_llm_agent.py` — a small two-step LLM agent using OpenAI-style chat completions.
  - `datasets/`
    - `marb_tasks.jsonl` — seed tasks for the Multi-Step Agent Retrieval Benchmark.
  - `eval/`
    - `marb.py` — MARB runner and success-rate computation.
    - `metrics.py`, `runner.py` — (legacy) single-query search metrics, kept for reference.
  - `cli.py` — MARB command-line entrypoint.
- `config/`
  - `providers.example.yaml` — template for configuring providers.
- `requirements.txt`

---

## Task design (MARB)

The initial task set `marb_tasks.jsonl` is intentionally **small but high‑quality**,
designed to simulate realistic agent workflows. Each record has:

- `id`: a unique identifier.
- `instruction`: a natural-language, multi-step task description.
- `input_context`: optional code/config snippet to modify or build on.
- `success_keywords`: key tokens that should appear in a successful answer
  (e.g., specific library imports, YAML keys, or API names).
- `search_hint`: optional starting point for the agent’s search planning.
- `notes`: free-text explanation of what is being tested.

Examples of task categories:

- Library discovery + code synthesis (e.g., Python OCR for PDFs).
- DevOps best practices (Dockerfiles, GitHub Actions, Kubernetes HPAs).
- Backend / API hardening (FastAPI security, rate limiting).
- Tooling and infra (modern testing setups, logging, LLM eval harnesses).

---

## How to interpret results (what is “good”?)

The benchmark is intentionally small, so you should treat it as a **directional
signal**, not a leaderboard:

- **Primary metric – Success%**  
  - Higher is better. If Exa consistently beats baselines (e.g. +10–20 points over
    `none` / generic web search), that is strong evidence it helps agents ship more
    tasks end‑to‑end.
  - Compare Exa to:
    - `none` – does *any* web search help on these tasks?
    - `serpapi` / `tavily` / `parallel` – does Exa win on realistic coding + infra
      tasks, not just synthetic QA?

- **Secondary metric – Time (s)**  
  - Lower is better, all else equal. A provider that solves more tasks but takes
    slightly longer can still be attractive; a provider that is slower *and* solves
    fewer tasks is clearly worse.
  - Because providers run in parallel, wall‑clock time per provider is directly
    comparable.

- **Patterns to look for**
  - Exa matches or beats generic search on **most tasks**, not just one or two.
  - Failure cases: where does Exa *not* help, and are those tasks representative of
    your production workload?
  - Stability: re‑run MARB on different days or with slightly modified tasks. Exa
    should remain competitive across reruns.

You can also subset the tasks (e.g. only Docker / k8s questions) and re‑run MARB to see
how providers behave on a specific vertical that matters to your team.

---

## How to extend

- **Add more MARB tasks**: append lines to `exa_benchmark/datasets/marb_tasks.jsonl`.
  With more time, this could be scaled by:
  - Mining real-world agent traces from internal tools (with privacy filters).
  - Using LLMs to propose candidate tasks, then manually curating and pruning.
- **Add new providers**: either implement a new `SearchClient` in `exa_benchmark/clients/`
  or configure a `generic_json_http` provider in `config/providers.yaml`.
- **Richer judges** (future work):
  - Replace the simple `success_keywords` heuristic with an LLM-as-a-judge
    that scores answers given the task and reference notes.
  - Track auxiliary metrics like number of search calls, total tokens, or latency.

---

## Time‑boxing & scope

This project is intentionally scoped to something that can be built in ~12 hours:

- A minimal abstraction for pluggable search APIs.
- A simple but realistic **agent loop** (model → search → model).
- A small, curated MARB task set with automatic, keyword-based success checks.

With more time, the natural next steps are:

- Grow the task set (including domain-specific verticals for particular customers).
- Swap in richer, LLM-based judges and structured scoring rubrics.
- Instrument the agent loop with telemetry (latency, token counts, number of hops).


