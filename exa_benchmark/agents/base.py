from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from ..clients.base import SearchClient


@dataclass
class AgentTask:
    """
    A single multi-step task for the Multi-Step Agent Retrieval Benchmark (MARB).
    """

    id: str
    instruction: str
    input_context: str
    success_keywords: list[str]
    notes: str | None = None
    search_hint: str | None = None


class Agent(Protocol):
    """
    Minimal interface for an LLM-based agent that can solve MARB tasks.
    """

    name: str

    def run_task(self, task: AgentTask, search_client: SearchClient | None) -> str:
        """
        Run the task using the given search client (or no search if None)
        and return the final answer as text.
        """


