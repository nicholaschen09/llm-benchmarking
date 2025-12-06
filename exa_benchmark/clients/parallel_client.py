from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import requests

from .base import SearchClient, SearchResult


@dataclass
class ParallelClient(SearchClient):
    """
    Client for Parallel's Search API.
    https://parallel.ai/blog/parallel-search-api
    """

    name: str = "parallel"
    api_key: str | None = None
    base_url: str = "https://api.parallel.ai/alpha/search"
    default_top_k: int = 10

    def __post_init__(self) -> None:
        if self.api_key is None:
            self.api_key = os.environ.get("PARALLEL_API_KEY")
        if not self.api_key:
            # Allow explicit pass or env var
            pass

    def _headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise ValueError(
                "ParallelClient requires an API key. "
                "Set PARALLEL_API_KEY or pass api_key explicitly."
            )
        return {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
        }

    def search(self, query: str, top_k: int = 10) -> List[SearchResult]:
        k = top_k or self.default_top_k
        
        # Parallel expects a list of search_queries. We just wrap our single query.
        payload: Dict[str, Any] = {
            "search_queries": [query],
            "processor": "base",  # default to 'base' as per blog post (2-5s)
            "max_results": k,
            "max_chars_per_result": 1500,
        }

        resp = requests.post(self.base_url, json=payload, headers=self._headers(), timeout=60)
        resp.raise_for_status()
        data = resp.json()
        return self.from_response(data)

    @staticmethod
    def from_response(data: Dict[str, Any]) -> List[SearchResult]:
        """
        Adapt Parallel's JSON format into SearchResult objects.
        Expected response structure based on typical search APIs, but we'll
        need to be robust. Assuming a list of results keyed by 'results' or similar.
        
        Wait, the blog post shows the request but not the response format.
        Most modern search APIs return something like { "results": [ { "url":..., "title":..., "content":... } ] }.
        I'll assume a standard 'results' key with 'url', 'title', and 'content' or 'snippet'.
        """
        results: List[SearchResult] = []
        
        # Defensive extraction
        items = data.get("results", [])
        if not items and isinstance(data, list):
            items = data

        for item in items:
            url = item.get("url") or item.get("link")
            if not url:
                continue
            
            title = item.get("title")
            snippet = item.get("content") or item.get("snippet") or item.get("text")
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

