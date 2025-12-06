from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import requests

from ..clients.base import SearchClient, SearchResult
from .base import Agent, AgentTask


def _openai_chat(
    messages: List[Dict[str, str]],
    model: str,
    api_key_env: str = "OPENAI_API_KEY",
) -> str:
    """
    Minimal wrapper around the OpenAI chat completions HTTP API.
    """
    api_key = os.environ.get(api_key_env)
    if not api_key:
        raise ValueError(
            f"Missing OpenAI API key: set {api_key_env} in your environment "
            "to run the agent."
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
    }
    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        json=payload,
        headers=headers,
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"Unexpected OpenAI response format: {data!r}")


@dataclass
class SimpleLLMAgent(Agent):
    """
    A very simple two-step agent:

    1) Ask the model for search queries given the task.
    2) Run those queries through a search provider (if any) and collect documents.
    3) Ask the model again to solve the task using the retrieved docs.

    This is deliberately lightweight but captures the core
    "model → search → model" loop needed for MARB.
    """

    name: str = "simple_llm_agent"
    model: str = "gpt-4o-mini"
    api_key_env: str = "OPENAI_API_KEY"
    max_search_queries: int = 2
    top_k_docs: int = 5

    def run_task(self, task: AgentTask, search_client: SearchClient | None) -> str:
        """
        Execute the task, optionally using web search.
        """
        # If no search is available, directly ask the model to solve the task.
        if search_client is None:
            messages = self._build_direct_messages(task)
            return _openai_chat(messages, model=self.model, api_key_env=self.api_key_env)

        # Step 1: Generate search queries.
        search_queries = self._generate_search_queries(task)

        # Step 2: Run queries with the search client.
        all_docs: List[SearchResult] = []
        for q in search_queries[: self.max_search_queries]:
            results = search_client.search(q, top_k=self.top_k_docs)
            all_docs.extend(results)

        # Step 3: Ask the model to solve the task using retrieved docs.
        messages = self._build_answer_messages(task, all_docs, search_queries)
        return _openai_chat(messages, model=self.model, api_key_env=self.api_key_env)

    # ------------------------------------------------------------------
    # Prompt helpers
    # ------------------------------------------------------------------

    def _build_direct_messages(self, task: AgentTask) -> List[Dict[str, str]]:
        return [
            {
                "role": "system",
                "content": (
                    "You are an expert software engineer and technical researcher. "
                    "Solve the user's task step by step. If you are not sure about "
                    "something, make a best-effort guess based only on your training."
                ),
            },
            {
                "role": "user",
                "content": self._format_task_prompt(task),
            },
        ]

    def _generate_search_queries(self, task: AgentTask) -> List[str]:
        """
        Ask the model for a small set of concrete search queries to run.
        """
        hint = f"\nYou can start from this search hint: {task.search_hint}\n" if task.search_hint else ""
        system_msg = {
            "role": "system",
            "content": (
                "You are helping to plan web searches for a multi-step technical task. "
                "Given the description, propose up to 3 concrete web search queries "
                "that will help you solve it. Return them as a numbered list."
            ),
        }
        user_msg = {
            "role": "user",
            "content": self._format_task_prompt(task) + hint,
        }
        raw = _openai_chat([system_msg, user_msg], model=self.model, api_key_env=self.api_key_env)

        # Very lightweight parsing of a numbered list into individual queries.
        queries: List[str] = []
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            # Accept formats like "1. query", "1) query", or just "query".
            for prefix in ("1.", "2.", "3.", "1)", "2)", "3)"):
                if line.startswith(prefix):
                    line = line[len(prefix) :].strip()
                    break
            queries.append(line)

        # Fallback: if parsing failed, use the entire response as a single query.
        if not queries:
            queries = [raw.strip()]

        return queries

    def _build_answer_messages(
        self,
        task: AgentTask,
        docs: List[SearchResult],
        queries: List[str],
    ) -> List[Dict[str, str]]:
        docs_text_parts: List[str] = []
        for idx, doc in enumerate(docs, start=1):
            title = doc.title or ""
            snippet = doc.snippet or ""
            docs_text_parts.append(
                f"[{idx}] {title}\nURL: {doc.url}\nSnippet: {snippet}\n"
            )
        docs_section = "\n".join(docs_text_parts) if docs_text_parts else "No external documents were retrieved."

        return [
            {
                "role": "system",
                "content": (
                    "You are an expert software engineer and technical writer. "
                    "Use the provided web documents when helpful. "
                    "Cite specific libraries, functions, or configuration options "
                    "when relevant, and produce a final, ready-to-use answer."
                ),
            },
            {
                "role": "user",
                "content": (
                    self._format_task_prompt(task)
                    + "\n\nWeb search queries you (the planner) suggested:\n"
                    + "\n".join(f"- {q}" for q in queries)
                    + "\n\nHere are the retrieved documents:\n"
                    + docs_section
                    + "\n\nNow, using the documents above, solve the task as completely as possible."
                ),
            },
        ]

    @staticmethod
    def _format_task_prompt(task: AgentTask) -> str:
        base = f"Task ID: {task.id}\n\nTask description:\n{task.instruction}\n"
        if task.input_context:
            base += f"\nAdditional context (code/data/config):\n{task.input_context}\n"
        if task.success_keywords:
            base += (
                "\nSuccess criteria (your answer should satisfy these, but do not list them verbatim):\n"
                + "\n".join(f"- {kw}" for kw in task.success_keywords)
                + "\n"
            )
        return base


