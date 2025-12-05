from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import requests

from .base import SearchClient, SearchResult


@dataclass
class ExaClient(SearchClient):
    """
    Minimal Exa search client for the benchmark.

    This assumes an Exa-like HTTP API that accepts a query and returns
    a JSON list of results with URLs, titles, and snippets.

    The exact API surface can be adjusted by editing `from_response`.
    """

    name: str = "exa"
    api_key: str | None = None
    base_url: str = "https://api.exa.ai/search"
    default_top_k: int = 10

    def __post_init__(self) -> None:
        if self.api_key is None:
            self.api_key = os.environ.get("EXA_API_KEY")
        if not self.api_key:
            raise ValueError(
                "ExaClient requires an API key. "
                "Set EXA_API_KEY or pass api_key explicitly."
            )

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def search(self, query: str, top_k: int = 10) -> List[SearchResult]:
        k = top_k or self.default_top_k
        payload: Dict[str, Any] = {
            "query": query,
            "num_results": k,
        }

        resp = requests.post(self.base_url, json=payload, headers=self._headers(), timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return self.from_response(data, k)

    @staticmethod
    def from_response(data: Dict[str, Any], top_k: int) -> List[SearchResult]:
        """
        Adapt Exa's JSON format into a list of SearchResult objects.

        This is intentionally defensive and should be tweaked once the exact
        Exa API response shape is known.
        """
        results: List[SearchResult] = []

        items: Optional[List[Dict[str, Any]]] = None
        if isinstance(data, dict):
            # Common patterns: {"results": [...]}, {"data": [...]}, or just a list.
            if isinstance(data.get("results"), list):
                items = data["results"]
            elif isinstance(data.get("data"), list):
                items = data["data"]

        if items is None and isinstance(data, list):
            items = data

        if not items:
            return []

        for item in items[:top_k]:
            url = str(item.get("url") or item.get("link") or "")
            if not url:
                # Skip entries without a URL; they are not useful for this benchmark.
                continue
            title = item.get("title")
            snippet = item.get("snippet") or item.get("summary") or item.get("content")
            score = item.get("score")
            try:
                score_f: Optional[float] = float(score) if score is not None else None
            except (TypeError, ValueError):
                score_f = None

            results.append(
                SearchResult(
                    url=url,
                    title=str(title) if title is not None else None,
                    snippet=str(snippet) if snippet is not None else None,
                    score=score_f,
                )
            )

        return results


