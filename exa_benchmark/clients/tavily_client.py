from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List

import requests

from .base import SearchClient, SearchResult


@dataclass
class TavilyClient(SearchClient):
    """
    Client for Tavily's Search API.

    Docs: https://docs.tavily.com/

    We call the `/search` endpoint and adapt the `results` list into
    the shared `SearchResult` structure used by MARB.
    """

    name: str = "tavily"
    api_key: str | None = None
    base_url: str = "https://api.tavily.com/search"
    default_top_k: int = 5

    def __post_init__(self) -> None:
        if self.api_key is None:
            self.api_key = os.environ.get("TAVILY_API_KEY")

    def _headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise ValueError(
                "TavilyClient requires an API key. "
                "Set TAVILY_API_KEY or pass api_key explicitly."
            )
        return {
            "Content-Type": "application/json",
        }

    def search(self, query: str, top_k: int = 10) -> List[SearchResult]:
        k = top_k or self.default_top_k

        payload: Dict[str, Any] = {
            "api_key": self.api_key,
            "query": query,
            "max_results": k,
            # Keep depth basic to stay within free/low-cost usage.
            "search_depth": "basic",
            "include_answer": False,
        }

        resp = requests.post(self.base_url, json=payload, headers=self._headers(), timeout=60)
        resp.raise_for_status()
        data = resp.json()
        return self.from_response(data, k)

    @staticmethod
    def from_response(data: Dict[str, Any], k: int) -> List[SearchResult]:
        """
        Map Tavily's response into SearchResult instances.

        Tavily returns:
        {
          "results": [
            {"title": "...", "url": "...", "content": "...", "score": ...},
            ...
          ],
          "answer": "...",
          ...
        }
        """
        items = data.get("results", [])
        results: List[SearchResult] = []

        for item in items[:k]:
            url = item.get("url")
            if not url:
                continue
            title = item.get("title")
            snippet = item.get("content")
            score = item.get("score")
            try:
                score_f = float(score) if score is not None else None
            except (ValueError, TypeError):
                score_f = None

            results.append(
                SearchResult(
                    url=str(url),
                    title=str(title) if title else None,
                    snippet=str(snippet) if snippet else None,
                    score=score_f,
                )
            )

        return results


