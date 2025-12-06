from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import requests

from .base import SearchClient, SearchResult


@dataclass
class GenericHTTPClient(SearchClient):
    """
    Very simple, configurable HTTP search client.

    This is meant for quick experiments with non-Exa providers that expose a
    JSON HTTP API. It assumes a "list of results" in the response and lets you
    configure how to extract URLs, titles, and snippets with dot-separated
    paths.
    """

    name: str
    base_url: str
    method: str = "GET"
    api_key_env: str | None = None
    api_key_header: str | None = None
    # For APIs like SerpAPI that expect the key as a query parameter (e.g. ?api_key=...).
    api_key_query_param: str | None = None
    query_param: str = "q"
    result_path: str = "results"
    url_field: str = "url"
    title_field: str = "title"
    snippet_field: str = "snippet"
    score_field: str = "score"
    default_top_k: int = 10

    def _headers(self) -> Dict[str, str]:
        headers: Dict[str, str] = {}
        if self.api_key_env and self.api_key_header:
            api_key = os.environ.get(self.api_key_env)
            if api_key:
                headers[self.api_key_header] = api_key
        return headers

    def _extract_items(self, data: Any) -> List[Dict[str, Any]]:
        """
        Follow a simple dot-separated path to get to the list of results.
        """
        current: Any = data
        for part in self.result_path.split("."):
            if part == "":
                continue
            if isinstance(current, dict):
                current = current.get(part)
            else:
                current = None
                break
        if isinstance(current, list):
            return current
        if isinstance(data, list):
            return data
        return []

    @staticmethod
    def _get_field(obj: Dict[str, Any], path: str) -> Optional[Any]:
        current: Any = obj
        for part in path.split("."):
            if part == "":
                continue
            if isinstance(current, dict):
                current = current.get(part)
            else:
                return None
        return current

    def search(self, query: str, top_k: int = 10) -> List[SearchResult]:
        k = top_k or self.default_top_k

        # Base params/payload for the query.
        api_key = os.environ.get(self.api_key_env) if self.api_key_env else None

        if self.method.upper() == "GET":
            params = {self.query_param: query, "num_results": k}
            if api_key and self.api_key_query_param:
                params[self.api_key_query_param] = api_key
            resp = requests.get(self.base_url, params=params, headers=self._headers(), timeout=30)
        else:
            payload = {self.query_param: query, "num_results": k}
            if api_key and self.api_key_query_param:
                payload[self.api_key_query_param] = api_key
            resp = requests.post(self.base_url, json=payload, headers=self._headers(), timeout=30)

        resp.raise_for_status()
        data = resp.json()
        items = self._extract_items(data)

        results: List[SearchResult] = []
        for item in items[:k]:
            url = self._get_field(item, self.url_field)
            if not url:
                continue
            title = self._get_field(item, self.title_field)
            snippet = self._get_field(item, self.snippet_field)
            score = self._get_field(item, self.score_field)
            try:
                score_f: Optional[float] = float(score) if score is not None else None
            except (TypeError, ValueError):
                score_f = None

            results.append(
                SearchResult(
                    url=str(url),
                    title=str(title) if title is not None else None,
                    snippet=str(snippet) if snippet is not None else None,
                    score=score_f,
                )
            )

        return results


