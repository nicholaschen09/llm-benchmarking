from __future__ import annotations

from dataclasses import dataclass
from typing import List, Protocol


@dataclass
class SearchResult:
    """
    Normalized search result.

    Only includes fields needed for this benchmark; more can be added later
    (e.g., snippet, score, raw JSON).
    """

    url: str
    title: str | None = None
    snippet: str | None = None
    score: float | None = None


class SearchClient(Protocol):
    """
    Minimal interface that all search providers must implement.
    """

    name: str

    def search(self, query: str, top_k: int = 10) -> List[SearchResult]:
        """
        Execute a search and return a ranked list of results.
        """


