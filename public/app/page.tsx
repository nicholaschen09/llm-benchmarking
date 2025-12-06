import Link from "next/link";

export default function Page() {
  return (
    <main className="page-root">
      <div className="page-inner">
        <section className="page-hero">
          <h1 className="page-hero-title">
            We built an agent benchmark around Exa-style semantic retrieval.
          </h1>
          <p className="page-hero-subtitle">
            Multi-Step Agent Retrieval Benchmark (MARB) evaluates how much better
            LLM agents perform on real coding and infra tasks when you swap in Exa
            search instead of generic web search—or no search at all.
          </p>
        </section>

        <section className="page-section">
          <p className="page-eyebrow">Overview</p>
          <h2>Why a benchmark for Exa & agentic workflows?</h2>
          <p>
            Exa is a search engine made for AIs, with APIs like{" "}
            <code>/search</code> and <code>/contents</code> that surface
            high-signal technical content for models to consume directly{" "}
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
            <strong>static embedding quality</strong>. They&apos;re useful, but
            they don&apos;t answer the question many Exa customers actually
            care about:
          </p>
          <p>
            &ldquo;If I plug Exa into my LLM agent instead of a generic web
            search API, do I solve more real multi-step tasks?&rdquo;
          </p>
        </section>

        <section className="page-section">
          <p className="page-eyebrow">Benchmark idea</p>
          <h2>MARB: Multi-Step Agent Retrieval Benchmark</h2>
          <p>
            MARB is a small but realistic benchmark that evaluates web search in
            the context of{" "}
            <strong>LLM agents completing multi-step software tasks</strong>.
            Each task is something an engineer might actually delegate to a
            capable agent, for example:
          </p>
          <ul>
            <li>
              <em>
                &ldquo;Find a Python library for OCR, read the docs, and write
                code to extract text from PDFs.&rdquo;
              </em>
            </li>
            <li>
              <em>
                &ldquo;Find recent best practices for Dockerfiles and optimize
                this example file.&rdquo;
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
            For each task, the agent can optionally call a search provider, read
            the returned documents, and then synthesize a final answer.
          </p>
        </section>

        <section className="page-section">
          <p className="page-eyebrow">Setup</p>
          <h2>Agent loop & evaluation protocol</h2>
          <p>
            The benchmark uses a very simple, model-agnostic agent loop with
            three phases:
          </p>
          <ol>
            <li>
              <strong>Planning:</strong> Given a MARB task, the model proposes a
              small set of concrete web search queries.
            </li>
            <li>
              <strong>Retrieval:</strong> The benchmark calls a configured web
              search API (e.g. Exa, Bing, SerpAPI, Brave) with those queries and
              collects top-k results (URLs, titles, snippets).
            </li>
            <li>
              <strong>Answering:</strong> The model receives the original task
              plus the retrieved documents and produces a final answer.
            </li>
          </ol>
          <p>
            To stay focused on retrieval, MARB keeps the LLM backbone fixed (in
            the reference implementation, a Gemini model via{" "}
            <code>GEMINI_API_KEY</code>) and only swaps out the search provider.
          </p>
          <p>
            Each task comes with lightweight{" "}
            <strong>success criteria</strong> (keywords such as specific library
            imports, YAML fields, or API names). A task is considered solved if
            all success keywords appear in the agent&apos;s final answer. This
            is a cheap, deterministic proxy for full human evaluation.
          </p>
        </section>

        <section className="page-section">
          <p className="page-eyebrow">Providers</p>
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
              <strong>No search</strong> – the agent relies only on its
              pretraining.
            </li>
            <li>
              <strong>Exa</strong> – via the <code>/search</code> API and an{" "}
              <code>EXA_API_KEY</code>.
            </li>
            <li>
              <strong>Bing Web Search</strong> – Azure Cognitive Services.
            </li>
            <li>
              <strong>SerpAPI</strong> – a meta-search wrapper around Google and
              others.
            </li>
            <li>
              <strong>Brave Search API</strong> – privacy-focused web search.
            </li>
          </ul>
          <p>
            Running MARB for all of them yields a simple comparison of{" "}
            <strong>task success rate</strong>: for each provider, what
            percentage of tasks did the agent complete end-to-end?
          </p>
        </section>

        <section className="page-section">
          <p className="page-eyebrow">Why this is convincing</p>
          <h2>Mapping search quality to real engineering outcomes</h2>
          <p>
            MARB is deliberately small and opinionated rather than exhaustive.
            The goal is not to publish a leaderboard; it&apos;s to give Exa and
            potential customers a concrete, reproducible way to answer:
          </p>
          <p>
            &ldquo;On the kinds of coding and infra tasks we care about, does
            Exa actually help our agents ship more things, faster?&rdquo;
          </p>
          <p>
            Because the tasks are grounded in realistic workflows (Dockerfiles,
            CI, k8s, FastAPI, logging, LLM eval harnesses), improvements on this
            benchmark should correlate with{" "}
            <strong>less time debugging agents</strong> and{" "}
            <strong>more tasks completed automatically</strong>.
          </p>
        </section>

        <section className="page-section">
          <p className="page-eyebrow">How to run it yourself</p>
          <p>
            The full MARB code lives in the main Python repo. Once you have
            Python and your API keys, you can run:
          </p>
          <pre className="page-code">
            <code>
              cd exa-benchmarking{"\n"}
              python -m venv .venv{"\n"}
              source .venv/bin/activate{"\n"}
              pip install -r requirements.txt{"\n"}
              {"\n"}
              export EXA_API_KEY=...{"\n"}
              export GEMINI_API_KEY=...{"\n"}
              export BING_API_KEY=...{"\n"}
              export SERPAPI_API_KEY=...{"\n"}
              export BRAVE_API_KEY=...{"\n"}
              {"\n"}
              python -m exa_benchmark.cli \{"\n"}
              {"  "}--provider none \{"\n"}
              {"  "}--provider exa \{"\n"}
              {"  "}--provider bing \{"\n"}
              {"  "}--provider serpapi \{"\n"}
              {"  "}--provider brave \{"\n"}
              {"  "}--tasks marb_tasks{"\n"}
            </code>
          </pre>
        </section>

        <footer className="page-footer">
          <span>MARB – Multi-Step Agent Retrieval Benchmark</span>
          <span>Built for Exa-style search APIs and LLM agents.</span>
        </footer>
      </div>
    </main>
  );
}


