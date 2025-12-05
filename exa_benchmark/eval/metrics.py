from __future__ import annotations

from typing import Iterable, List, Sequence


def hit_at_k(rank: int | None, k: int) -> float:
    """
    1.0 if a relevant document appears within rank k (i.e., rank <= k), else 0.0.
    """
    if rank is None:
        return 0.0
    return 1.0 if 1 <= rank <= k else 0.0


def reciprocal_rank(rank: int | None) -> float:
    """
    MRR component for a single query.
    """
    if rank is None or rank <= 0:
        return 0.0
    return 1.0 / float(rank)


def recall_at_k(num_relevant_retrieved: int, num_relevant_total: int) -> float:
    """
    Simple recall@k: fraction of all known relevant URLs retrieved in the top-k.
    """
    if num_relevant_total <= 0:
        return 0.0
    return float(num_relevant_retrieved) / float(num_relevant_total)


def mean(values: Iterable[float]) -> float:
    vals: List[float] = [v for v in values]
    if not vals:
        return 0.0
    return sum(vals) / float(len(vals))


def first_hit_rank(
    retrieved_urls: Sequence[str],
    relevant_urls: Sequence[str],
) -> int | None:
    """
    Return the 1-based rank of the first retrieved URL that matches any relevant URL,
    using simple string equality. Returns None if there is no match.
    """
    relevant_set = {u.strip() for u in relevant_urls if u.strip()}
    if not relevant_set:
        return None

    for idx, url in enumerate(retrieved_urls, start=1):
        norm = url.strip()
        if norm in relevant_set:
            return idx
    return None


