"use client";

import Link from "next/link";

type ProviderMetric = {
  provider: string;
  success: number;
};

const STATIC_METRICS: ProviderMetric[] = [
  { provider: "none", success: 75.0 },
  { provider: "exa", success: 87.5 },
  { provider: "serpapi", success: 62.5 },
  { provider: "parallel", success: 75.0 },
  { provider: "tavily", success: 75.0 },
];

export default function Page() {

  return (
    <main className="page-root">
      <div className="page-inner">
        <section className="page-hero">
          <h1 className="page-hero-title">
            I built an agent benchmark around Exa-style semantic retrieval.
          </h1>
          <p className="page-hero-subtitle">
            The Multi-Step Agent Retrieval Benchmark (MARB) evaluates how much better
            LLM agents perform on real coding and infra tasks when you swap in Exa
            search instead of generic web search—or no search at all.
          </p>
          <div className="hero-links" style={{ marginTop: "1.5rem" }}>
            <Link
              href="https://github.com/nicholaschen09/llm-benchmarking"
              className="author-pill"
              aria-label="View repo on GitHub"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="author-icon"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05a9.24 9.24 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.64 1.03 2.76 0 3.96-2.34 4.82-4.57 5.08.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
                />
              </svg>
            </Link>
          </div>

          <section className="metrics-card" aria-label="MARB results explorer">
            <div className="metrics-header">
              <p className="metrics-title">Retrieval for software engineering</p>
              <p className="metrics-subtitle">MARB snapshot · 8 tasks</p>
            </div>

            <div className="metrics-wrapper">
              <div className="metrics-y-axis">
                <div className="metrics-axis-title">ACCURACY</div>
                <div className="metrics-y-labels">
                  <div className="metrics-y-tick" style={{ bottom: "80%" }}>80</div>
                  <div className="metrics-y-tick" style={{ bottom: "60%" }}>60</div>
                  <div className="metrics-y-tick" style={{ bottom: "40%" }}>40</div>
                  <div className="metrics-y-tick" style={{ bottom: "20%" }}>20</div>
                  <div className="metrics-y-tick" style={{ bottom: "0%" }}>0</div>
                </div>
              </div>

              <div className="metrics-chart-area">
                <div className="metrics-grid-lines">
                  <div className="metrics-grid-line" style={{ bottom: "80%" }} />
                  <div className="metrics-grid-line" style={{ bottom: "60%" }} />
                  <div className="metrics-grid-line" style={{ bottom: "40%" }} />
                  <div className="metrics-grid-line" style={{ bottom: "20%" }} />
                  {/* Bottom line removed from grid-lines so we can layer it on top */}
                </div>

                <div className="metrics-bars-row">
                  {STATIC_METRICS.map((m) => (
                    <div key={m.provider} className="metrics-bar-group">
                      <div
                        className="metrics-bar-value"
                        style={{ bottom: `${m.success}%` }}
                      >
                        {m.success.toFixed(1)}%
                      </div>
                      <div
                        className={`metrics-bar-fill ${m.provider === "exa" ? "metrics-bar-fill-exa" : ""
                          }`}
                        style={{ height: `${m.success}%` }}
                      />
                      <div className="metrics-bar-label">{m.provider}</div>
                    </div>
                  ))}
                </div>

                {/* X-Axis Line overlaying the bars */}
                <div
                  className="metrics-grid-line"
                  style={{
                    bottom: "40px",
                    background: "#000",
                    height: "1.5px",
                    zIndex: 10
                  }}
                />
              </div>
            </div>
          </section>
        </section>

        <section className="page-section">
          <h2>Why a benchmark for Exa & agentic workflows?</h2>
          <p>
            Exa is a search engine made for AIs, with APIs like <code>/search</code> and{" "}
            <code>/contents</code> that surface high-signal technical content for models
            to consume directly{" "}
            <span>
              (see the official docs for more:
              <Link
                href="https://docs.exa.ai/reference/getting-started"
                className="underline underline-offset-4"
              >
                Exa – Getting Started
              </Link>
              ).
            </span>
          </p>
          <p>
            Most existing benchmarks (like MTEB) focus on{" "}
            <strong>static embedding quality</strong>. They&apos;re useful, but they
            don&apos;t answer the question many Exa customers actually care about:
          </p>
          <p>
            &ldquo;If I plug Exa into my LLM agent instead of a generic web search API,
            do I solve more real multi-step tasks?&rdquo;
          </p>
        </section>

        <section className="page-section">
          <h2>MARB: Multi-Step Agent Retrieval Benchmark</h2>
          <p>
            MARB is a small but realistic benchmark that evaluates web search in the
            context of <strong>LLM agents completing multi-step software tasks</strong>.
            Each task is something an engineer might actually delegate to a capable
            agent.
          </p>
          <p>
            Unlike generic QA datasets, MARB tasks are designed to be <strong>unsolvable</strong> without external knowledge or hallucination-prone if the model relies solely on training data. They target specific, often niche, library versions or configuration syntax.
          </p>
          <ul>
            <li>
              <em>
                &ldquo;Find a Python library for OCR, read the docs, and write code to
                extract text from PDFs.&rdquo;
              </em>
            </li>
            <li>
              <em>
                &ldquo;Find recent best practices for Dockerfiles and optimize this
                example file.&rdquo;
              </em>
            </li>
            <li>
              <em>
                &ldquo;Given a simple Kubernetes Deployment, add a
                HorizontalPodAutoscaler with sane defaults.&rdquo;
              </em>
            </li>
          </ul>
          <p>
            For each task, the agent can optionally call a search provider, read the
            returned documents, and then synthesize a final answer.
          </p>
          <pre className="page-code" style={{ marginTop: "1rem" }}>
            <code>
              {`@dataclass
class AgentTask:
    id: str
    instruction: str       # e.g. "Find a Python library for OCR..."
    input_context: str     # e.g. "Use this specific PDF layout..."
    success_keywords: list # e.g. ["pytesseract", "pdf2image"]`}
            </code>
          </pre>
        </section>

        <section className="page-section">
          <h2>Agent loop & evaluation protocol</h2>
          <p>
            The benchmark uses a very simple, model-agnostic agent loop with three
            phases. We keep the loop intentionally simple to isolate <strong>retrieval quality</strong> as the primary variable.
          </p>
          <pre className="page-code" style={{ marginBottom: "1rem" }}>
            <code>
              {`# Pseudo-code of the MARB agent loop
def run_agent(task, search_client, model):
    # 1. Plan: Model generates search queries based on task
    queries = model.plan_queries(task.instruction)
    
    # 2. Retrieve: Search API returns raw results
    search_results = []
    for q in queries:
        items = search_client.search(q)
        search_results.extend(items)
        
    # 3. Answer: Model synthesizes final response
    return model.answer(task.instruction, context=search_results)`}
            </code>
          </pre>
          <ol>
            <li>
              <strong>Planning:</strong> Given a MARB task, the model proposes a small
              set of concrete web search queries. This tests if the search engine can handle the phrasing an agent naturally produces.
            </li>
            <li>
              <strong>Retrieval:</strong> The benchmark calls a configured web search
              API (e.g. Exa, Parallel, Brave, SerpAPI) with those queries and collects top-k
              results. We normalize these into a standard format (URL, title, snippet) to ensure fair comparison.
            </li>
            <li>
              <strong>Answering:</strong> The model receives the original task plus the
              retrieved documents and produces a final answer.
            </li>
          </ol>
          <p>
            To stay focused on retrieval, MARB keeps the LLM backbone fixed (in the
            reference implementation, a <strong>Gemini 2.5 Flash</strong> model via <code>GEMINI_API_KEY</code>)
            and only swaps out the search provider.
          </p>
          <p>
            Each task comes with lightweight <strong>success criteria</strong>. We use deterministic keyword matching as a proxy for correctness. For example, if a task asks to "extract text from PDFs", finding <code>pytesseract</code> or <code>pdf2image</code> in the answer counts as a success. This avoids the variance and cost of "LLM-as-a-judge" while remaining directionally accurate for engineering tasks.
          </p>
        </section>

        <section className="page-section">
          <h2>Comparing Exa against baseline web search</h2>
          <p>
            The reference MARB implementation is intentionally{" "}
            <strong>provider-agnostic</strong>. It defines a tiny{" "}
            <code className="px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs">
              SearchClient
            </code>{" "}
            interface. This abstraction allows us to plug in any search API by simply writing a small adapter class.
          </p>
          <pre className="page-code" style={{ marginBottom: "1rem" }}>
            <code>
              {`class SearchClient(Protocol):
    name: str
    
    def search(self, query: str, top_k: int = 10) -> List[SearchResult]:
        """
        Standard interface for all providers.
        Returns normalized SearchResult objects.
        """
        pass`}
            </code>
          </pre>
          <p>
            Currently supported providers include:
          </p>
          <ul>
            <li>
              <strong>No search</strong> – Baseline. The agent relies only on its pretraining.
            </li>
            <li>
              <strong>Exa</strong> – via the <code>/search</code> API.
            </li>
            <li>
              <strong>Parallel</strong> – via their Search API.
            </li>
            <li>
              <strong>Brave Search API</strong> – privacy-focused web search.
            </li>
            <li>
              <strong>SerpAPI</strong> – a meta-search wrapper around Google and others.
            </li>
          </ul>
          <p>
            Running MARB for all of them yields a simple comparison of{" "}
            <strong>task success rate</strong>: for each provider, what percentage of
            tasks did the agent complete end-to-end? The CLI also records{" "}
            <strong>wall-clock runtime per provider</strong>, so you can see not just
            which search engine helps the agent solve more tasks, but how long each one
            takes to do so.
          </p>
          <pre className="page-code" style={{ marginTop: "1rem" }}>
            <code>
              {`Provider        Agent                Solved     Total      Success%
-----------------------------------------------------------------
none            simple_llm_agent     6          8          75.0
serpapi         simple_llm_agent     5          8          62.5
exa             simple_llm_agent     7          8          87.5
parallel        simple_llm_agent     6          8          75.0
tavily          simple_llm_agent     6          8          75.0`}
            </code>
          </pre>
        </section>

        <section className="page-section">
          <h2>How to run the benchmark</h2>
          <p>
            The entire benchmark is open source. To run it yourself, you&apos;ll need to
            set up your environment variables in a <code>.env</code> file:
          </p>
          <pre className="page-code" style={{ marginTop: "1rem" }}>
            <code>
              {`EXA_API_KEY=...
GEMINI_API_KEY=...    # The LLM backbone
PARALLEL_API_KEY=...  # Optional
SERPAPI_API_KEY=...   # Optional
TAVILY_API_KEY=...    # Optional`}
            </code>
          </pre>
          <p>
            Then, you can run the full comparison with a single CLI command. This script
            iterates through the providers, runs the agent loop for each task, and
            prints the final summary table.
          </p>
          <pre className="page-code" style={{ marginTop: "1rem" }}>
            <code>
              {`# Install dependencies
pip install -r requirements.txt

# Run MARB against all configured providers
python -m exa_benchmark.cli \\
  --provider none \\
  --provider exa \\
  --provider parallel \\
  --provider serpapi \\
  --provider tavily \\
  --tasks marb_tasks`}
            </code>
          </pre>
          <p>
            Under the hood, the CLI runs <strong>all selected providers in parallel</strong>{" "}
            using a thread pool. Each provider gets its own progress bar, so you can see
            Exa, Parallel, SerpAPI, Tavily, and the no-search baseline all advancing at
            the same time while the benchmark executes. The summary table at the end
            includes both success rate and wall-clock time per provider.
          </p>
        </section>

        <section className="page-section">
          <h2>Mapping search quality to real engineering outcomes</h2>
          <p>
            MARB is deliberately small and opinionated rather than exhaustive. The goal
            is not to publish a leaderboard; it&apos;s to give Exa and potential
            customers a concrete, reproducible way to answer:
          </p>
          <p>
            &ldquo;On the kinds of coding and infra tasks we care about, does Exa
            actually help our agents ship more things, faster?&rdquo;
          </p>
          <p>
            Because the tasks are grounded in realistic workflows (Dockerfiles, CI, k8s,
            FastAPI, logging, LLM eval harnesses), improvements on this benchmark should
            correlate with <strong>less time debugging agents</strong> and{" "}
            <strong>more tasks completed automatically</strong>.
          </p>
        </section>

        <section className="page-section">
          <h2>How to improve benchmark performance</h2>
          <p>
            Based on the results from MARB, here are several strategies to improve search provider performance on agent-based tasks:
          </p>

          <h3>For providers scoring below 70%</h3>
          <ul>
            <li>
              Improve query understanding: Focus on better semantic parsing of technical queries and domain-specific terminology.
            </li>
            <li>
              Enhance result relevance: Implement better ranking algorithms that prioritize authoritative technical documentation and recent content.
            </li>
            <li>
              Optimize snippet extraction: Ensure snippets contain actionable code examples and configuration patterns, not just descriptions.
            </li>
          </ul>

          <h3>For providers scoring 70-85%</h3>
          <ul>
            <li>
              Fine-tune context windows: Experiment with different amounts of context returned to balance comprehensiveness with relevance.
            </li>
            <li>
              Add re-ranking mechanisms: Implement a second-pass ranking based on task-specific signals like recency, code presence, and source authority.
            </li>
            <li>
              Support structured queries: Allow agents to specify filters like date ranges, file types, or specific domains for more targeted results.
            </li>
          </ul>

          <h3>For all providers</h3>
          <ul>
            <li>
              Analyze failure patterns: Review tasks that commonly fail to identify gaps in coverage or retrieval strategy.
            </li>
            <li>
              Implement query expansion: Automatically expand technical terms with synonyms and related concepts (e.g., "k8s" → "Kubernetes").
            </li>
            <li>
              Cache and learn from usage: Build provider-specific knowledge of what types of queries work best and optimize accordingly.
            </li>
            <li>
              Consider hybrid approaches: Combine multiple search strategies (semantic + keyword) or multiple providers for better coverage.
            </li>
          </ul>

          <p>
            The key insight from MARB is that <strong>agent-oriented search differs from human search</strong>.
            Agents need structured, actionable information with working code examples, not just conceptual explanations.
            Providers that optimize for these needs—like Exa&apos;s focus on technical content—consistently outperform generic web search on engineering tasks.
          </p>
        </section>

        <section className="author">
          <p className="author-title">By Nicholas Chen</p>
          <div className="author-links">
            <Link
              href="mailto:nicholas.chen243@gmail.com"
              className="author-pill"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="author-icon">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  ry="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M5 8.5 12 13l7-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="https://github.com/nicholaschen09"
              className="author-pill"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="author-icon">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05a9.24 9.24 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.64 1.03 2.76 0 3.96-2.34 4.82-4.57 5.08.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
                />
              </svg>
            </Link>
            <Link
              href="https://x.com/nicholaschen__"
              className="author-pill"
              aria-label="Twitter / X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="author-icon">
                <path
                  fill="currentColor"
                  d="M18.25 3H21L14.5 10.39 22 21h-5.5l-4.23-6.06L7.4 21H4.65l6.93-7.86L4 3h5.62l3.78 5.4L18.25 3Zm-1.93 16.18h1.46L7.76 4.73H6.19l10.13 14.45Z"
                />
              </svg>
            </Link>
            <Link
              href="https://www.linkedin.com/in/nicholas-chen-85886726a/"
              className="author-pill"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="author-icon">
                <path
                  fill="currentColor"
                  d="M6.09 4.5A1.84 1.84 0 1 1 2.4 4.5a1.84 1.84 0 0 1 3.68 0ZM2.6 8.18h2.98V21H2.6V8.18ZM9.26 8.18h2.86v1.75h.04c.4-.76 1.4-1.56 2.88-1.56 3.07 0 3.64 2.02 3.64 4.64V21h-3v-6.6c0-1.57-.03-3.6-2.19-3.6-2.19 0-2.53 1.7-2.53 3.48V21h-3V8.18Z"
                />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
