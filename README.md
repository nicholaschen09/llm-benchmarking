## Exa ML Troubleshooting Search Benchmark

This repo contains a small, extensible benchmark to compare web search APIs on a concrete, high‑value developer task:
**finding the right resource to debug ML / infra issues quickly**.

Instead of measuring generic embedding quality (like MTEB), this benchmark focuses on a narrow but important vertical:
queries about PyTorch / TensorFlow errors, distributed training failures, CUDA issues, data bugs, and other ML engineering problems.
For each query, we provide one or more **ground‑truth URLs** that practitioners typically use to resolve the issue
(GitHub issues, forum threads, StackOverflow answers, blog posts, etc.).

The core question: **“Given a real ML debugging query, how quickly does a search API surface the best troubleshooting resource?”**

---

## What this benchmark measures

- **Hit rate / Recall@k**: Does any ground‑truth URL appear in the top‑k results?
- **MRR@k**: How early in the ranked list does a relevant result appear?
- **Domain awareness** (optional analysis): How often does the search engine surface “expert” pages
  (e.g., GitHub issues, official docs, well‑known ML blogs) instead of generic SEO pages?

Why this is useful for Exa:

- ML / infra debugging is a high‑value, time‑sensitive workflow where better search results map directly to engineering time saved.
- Exa is optimized for technical content (code, repos, issues), so it should shine on queries whose answers live in GitHub, docs, and forums.
- The framework is **API‑agnostic**: you can plug in Exa and other providers (e.g., traditional web search APIs) and compare.

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

Then edit `config/providers.yaml` and add your credentials:

```yaml
providers:
  - name: exa
    type: exa
    api_key_env: EXA_API_KEY
    # Optional: base_url, top_k, extra parameters

  - name: other_search
    type: generic_json_http
    api_key_env: OTHER_API_KEY
    base_url: https://api.example.com/search
    method: GET
    query_param: q
    # ... see comments in providers.example.yaml
```

Export your keys in the shell before running:

```bash
export EXA_API_KEY="..."
export OTHER_API_KEY="..."
```

### 3. Run the eval

Run the main CLI with a chosen provider and dataset:

```bash
python -m exa_benchmark.cli \
  --provider exa \
  --dataset ml_troubleshooting
```

You’ll see per‑query results and aggregate metrics like Hit@k and MRR@k.

To compare multiple providers side by side:

```bash
python -m exa_benchmark.cli \
  --provider exa \
  --provider other_search \
  --dataset ml_troubleshooting
```

---

## Repo structure

- `exa_benchmark/`
  - `clients/`
    - `base.py` — abstract `SearchClient` interface.
    - `exa_client.py` — concrete client for the Exa search API.
    - `generic_http_client.py` — simple configurable HTTP client for other search APIs.
  - `datasets/`
    - `ml_troubleshooting.jsonl` — small seed dataset of ML / infra debugging queries with ground‑truth URLs.
  - `eval/`
    - `metrics.py` — implementations of Hit@k, Recall@k, MRR@k, etc.
    - `runner.py` — core evaluation loop.
  - `cli.py` — command‑line entrypoint.
- `config/`
  - `providers.example.yaml` — template for configuring providers.
- `requirements.txt`

---

## Dataset design

The initial dataset `ml_troubleshooting.jsonl` is intentionally **small but high‑quality**,
designed to simulate realistic ML engineer workflows. Each record has:

- `id`: a unique identifier.
- `query`: a natural‑language search query (often copied from an error message).
- `relevant_urls`: a list of URLs that practitioners actually use to resolve the issue.
- `notes`: free‑text explanation of why these URLs are good answers.

Examples of query categories:

- PyTorch / TensorFlow runtime errors (shape mismatches, device errors, mixed precision issues).
- CUDA / GPU issues (out‑of‑memory, driver mismatches, NCCL init failures).
- Distributed training and orchestration (DDP, DeepSpeed, Ray, Kubernetes pods, Slurm).
- Data / input bugs (corrupted images, NaNs, exploding gradients).

Evaluation treats any hit on `relevant_urls` as a success for Hit@k / Recall@k and uses the first hit’s rank for MRR.

---

## How to extend

- **Add more tasks**: append lines to `exa_benchmark/datasets/ml_troubleshooting.jsonl`.
  With more time, this could be scaled by:
  - Mining real‑world ML error logs (with privacy filters).
  - Using LLMs to propose candidate URLs, then manually curating.
- **Add new providers**: either implement a new `SearchClient` in `exa_benchmark/clients/`
  or configure a `generic_json_http` provider in `config/providers.yaml`.
- **Richer metrics** (future work):
  - Use an LLM to grade snippet‑level relevance from the result’s title/snippet/body.
  - Track latency, rate‑limit behavior, and robustness to noisy queries.

---

## Time‑boxing & scope

This project is intentionally scoped to something that can be built in ~12 hours:

- A minimal but solid abstraction for pluggable search APIs.
- A small, curated ML‑troubleshooting dataset with clear ground‑truth URLs.
- A basic metrics suite (Hit@k, Recall@k, MRR@k) and CLI for running comparisons.

With more time, the natural next steps are:

- Grow the dataset (including other verticals like “LLM app debugging” or “training infra on cloud X”).
- Incorporate LLM‑based grading for nuanced relevance.
- Build a simple dashboard for comparing providers across datasets and time.


