from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

from tqdm import tqdm

from ..agents.base import AgentTask
from ..agents.simple_llm_agent import SimpleLLMAgent
from ..clients.base import SearchClient
from ..clients.exa_client import ExaClient
from ..clients.generic_http_client import GenericHTTPClient


@dataclass
class MarbResult:
    provider_name: str
    agent_name: str
    num_tasks: int
    num_solved: int

    @property
    def success_rate(self) -> float:
        if self.num_tasks == 0:
            return 0.0
        return float(self.num_solved) / float(self.num_tasks)


def load_marb_tasks(path: Path) -> List[AgentTask]:
    tasks: List[AgentTask] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            tasks.append(
                AgentTask(
                    id=str(obj["id"]),
                    instruction=str(obj["instruction"]),
                    input_context=str(obj.get("input_context", "")),
                    success_keywords=list(obj.get("success_keywords", [])),
                    notes=obj.get("notes"),
                    search_hint=obj.get("search_hint"),
                )
            )
    return tasks


def make_search_client(provider_name: str, cfg: dict) -> SearchClient | None:
    """
    Instantiate a SearchClient from the YAML config.

    Special case: provider_name in {"none", "no_search"} returns None to disable search.
    """
    if provider_name in {"none", "no_search"}:
        return None

    providers_cfg = {p["name"]: p for p in cfg.get("providers", [])}
    if provider_name not in providers_cfg:
        raise KeyError(f"Provider '{provider_name}' not found in config/providers.yaml")
    p_cfg = providers_cfg[provider_name]
    p_type = p_cfg.get("type")

    if p_type == "exa":
        return ExaClient(
            name=provider_name,
            api_key=None,  # pulled from EXA_API_KEY in __post_init__
            base_url=p_cfg.get("base_url", "https://api.exa.ai/search"),
            default_top_k=int(p_cfg.get("default_top_k", 10)),
        )

    if p_type == "generic_json_http":
        return GenericHTTPClient(
            name=provider_name,
            base_url=p_cfg["base_url"],
            method=p_cfg.get("method", "GET"),
            api_key_env=p_cfg.get("api_key_env"),
            api_key_header=p_cfg.get("api_key_header"),
            query_param=p_cfg.get("query_param", "q"),
            result_path=p_cfg.get("result_path", "results"),
            url_field=p_cfg.get("url_field", "url"),
            title_field=p_cfg.get("title_field", "title"),
            snippet_field=p_cfg.get("snippet_field", "snippet"),
            score_field=p_cfg.get("score_field", "score"),
            default_top_k=int(p_cfg.get("default_top_k", 10)),
        )

    raise ValueError(f"Unknown provider type '{p_type}' for provider '{provider_name}'")


def task_solved(answer: str, task: AgentTask) -> bool:
    """
    Very lightweight automatic judge:
    - Treat a task as solved if all success_keywords appear (case-insensitive)
      in the model's final answer.
    """
    text = answer.lower()
    for kw in task.success_keywords:
        if kw.lower() not in text:
            return False
    return True


def run_marb_for_provider(
    provider_name: str,
    cfg: dict,
    tasks: Sequence[AgentTask],
    agent: SimpleLLMAgent | None = None,
) -> MarbResult:
    """
    Run MARB for a single provider (including the special 'none' provider).
    """
    if agent is None:
        agent = SimpleLLMAgent()

    search_client = make_search_client(provider_name, cfg)
    solved = 0

    for task in tqdm(tasks, desc=f"Provider={provider_name}", unit="task"):
        answer = agent.run_task(task, search_client)
        if task_solved(answer, task):
            solved += 1

    return MarbResult(
        provider_name=provider_name,
        agent_name=agent.name,
        num_tasks=len(tasks),
        num_solved=solved,
    )


def format_marb_results(results: Iterable[MarbResult]) -> str:
    rows: List[str] = []
    header = f"{'Provider':<15} {'Agent':<20} {'Solved':<10} {'Total':<10} {'Success%':<10}"
    rows.append(header)
    rows.append("-" * len(header))
    for res in results:
        pct = 100.0 * res.success_rate
        rows.append(
            f"{res.provider_name:<15} {res.agent_name:<20} "
            f"{res.num_solved:<10d} {res.num_tasks:<10d} {pct:<10.1f}"
        )
    return "\n".join(rows)


