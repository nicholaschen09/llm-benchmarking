import Link from "next/link";

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
            agent, for example:
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
        </section>

        <section className="page-section">
          <h2>Agent loop & evaluation protocol</h2>
          <p>
            The benchmark uses a very simple, model-agnostic agent loop with three
            phases:
          </p>
          <ol>
            <li>
              <strong>Planning:</strong> Given a MARB task, the model proposes a small
              set of concrete web search queries.
            </li>
            <li>
              <strong>Retrieval:</strong> The benchmark calls a configured web search
              API (e.g. Exa, Parallel, Brave, SerpAPI) with those queries and collects top-k
              results (URLs, titles, snippets).
            </li>
            <li>
              <strong>Answering:</strong> The model receives the original task plus the
              retrieved documents and produces a final answer.
            </li>
          </ol>
          <p>
            To stay focused on retrieval, MARB keeps the LLM backbone fixed (in the
            reference implementation, a Gemini model via <code>GEMINI_API_KEY</code>)
            and only swaps out the search provider.
          </p>
          <p>
            Each task comes with lightweight <strong>success criteria</strong> (keywords
            such as specific library imports, YAML fields, or API names). A task is
            considered solved if all success keywords appear in the agent&apos;s final
            answer. This is a cheap, deterministic proxy for full human evaluation.
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
            interface and plugs in:
          </p>
          <ul>
            <li>
              <strong>No search</strong> – the agent relies only on its pretraining.
            </li>
            <li>
              <strong>Exa</strong> – via the <code>/search</code> API and an{" "}
              <code>EXA_API_KEY</code>.
            </li>
            <li>
              <strong>Parallel</strong> – via their Search API (<code>PARALLEL_API_KEY</code>).
            </li>
            <li>
              <strong>Brave Search API</strong> – privacy-focused web search (replacing Bing, which is retiring in 2025).
            </li>
            <li>
              <strong>SerpAPI</strong> – a meta-search wrapper around Google and others.
            </li>
          </ul>
          <p>
            Running MARB for all of them yields a simple comparison of{" "}
            <strong>task success rate</strong>: for each provider, what percentage of
            tasks did the agent complete end-to-end?
          </p>
          <pre className="page-code" style={{ marginTop: "1rem" }}>
            <code>
              {`Provider        Agent                Solved     Total      Success%
-----------------------------------------------------------------
none            simple_llm_agent     6          8          75.0
serpapi         simple_llm_agent     5          8          62.5
exa             simple_llm_agent     6          8          75.0
parallel        simple_llm_agent     5          8          62.5`}
            </code>
          </pre>
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
