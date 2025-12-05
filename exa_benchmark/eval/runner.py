from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

from tqdm import tqdm

from ..clients.base import SearchClient
from .metrics import (
    first_hit_rank,
    hit_at_k,
    mean,
    reciprocal_rank,
    recall_at_k,
)


@dataclass
class EvalExample:
    id: str
    query: str
    relevant_urls: List[str]
    notes: str | None = None


def load_dataset(path: Path) -> List[EvalExample]:
    """
    Load a JSONL dataset of EvalExample objects.
    """
    examples: List[EvalExample] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            examples.append(
                EvalExample(
                    id=str(obj["id"]),
                    query=str(obj["query"]),
                    relevant_urls=list(obj.get("relevant_urls", [])),
                    notes=obj.get("notes"),
                )
            )
    return examples


@dataclass
class EvalResult:
    provider_name: str
    k: int
    hit_at_k: float
    mrr_at_k: float
    recall_at_k: float
    num_queries: int


def evaluate_provider(
    provider: SearchClient,
    examples: Sequence[EvalExample],
    k: int = 10,
) -> EvalResult:
    """
    Run the benchmark for a single provider and return aggregate metrics.
    """
    per_query_hit: List[float] = []
    per_query_rr: List[float] = []
    per_query_recall: List[float] = []

    for ex in tqdm(examples, desc=f"Evaluating {provider.name}", unit="query"):
        results = provider.search(ex.query, top_k=k)
        urls = [r.url for r in results]
        rank = first_hit_rank(urls, ex.relevant_urls)
        per_query_hit.append(hit_at_k(rank, k))
        per_query_rr.append(reciprocal_rank(rank))

        # For recall@k, we count how many of the known relevant URLs are in the top-k.
        retrieved_set = {u.strip() for u in urls}
        relevant_set = {u.strip() for u in ex.relevant_urls if u.strip()}
        num_relevant_retrieved = len(retrieved_set.intersection(relevant_set))
        per_query_recall.append(recall_at_k(num_relevant_retrieved, len(relevant_set)))

    return EvalResult(
        provider_name=provider.name,
        k=k,
        hit_at_k=mean(per_query_hit),
        mrr_at_k=mean(per_query_rr),
        recall_at_k=mean(per_query_recall),
        num_queries=len(examples),
    )


def format_results(results: Iterable[EvalResult]) -> str:
    """
    Create a small human-readable table of results.
    """
    rows: List[str] = []
    header = f"{'Provider':<20} {'K':<3} {'Hit@K':<10} {'MRR@K':<10} {'Recall@K':<12} {'N':<6}"
    rows.append(header)
    rows.append("-" * len(header))
    for res in results:
        rows.append(
            f"{res.provider_name:<20} {res.k:<3d} "
            f"{res.hit_at_k:<10.3f} {res.mrr_at_k:<10.3f} {res.recall_at_k:<12.3f} {res.num_queries:<6d}"
        )
    return "\n".join(rows)


