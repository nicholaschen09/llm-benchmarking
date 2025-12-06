from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

import yaml
from dotenv import load_dotenv

from .eval.marb import (
    format_marb_results,
    load_marb_tasks,
    run_marb_for_provider,
)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Multi-Step Agent Retrieval Benchmark (MARB)",
    )
    parser.add_argument(
        "--provider",
        action="append",
        dest="providers",
        required=True,
        help=(
            "Name of provider(s) to run (must exist in config/providers.yaml), "
            "or 'none' / 'no_search' to disable web search. "
            "Can be passed multiple times."
        ),
    )
    parser.add_argument(
        "--tasks",
        default="marb_tasks",
        help="Name of task set (currently only 'marb_tasks' is supported).",
    )
    parser.add_argument(
        "--config",
        default="config/providers.yaml",
        help="Path to providers config YAML.",
    )
    return parser


def load_config(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"Config file {path} not found. "
            "Copy config/providers.example.yaml to config/providers.yaml and edit it."
        )
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def tasks_path(tasks_name: str) -> Path:
    root = Path(__file__).resolve().parent
    data_dir = root / "datasets"
    if tasks_name == "marb_tasks":
        return data_dir / "marb_tasks.jsonl"
    raise ValueError(f"Unknown tasks set '{tasks_name}'")


def main(argv: List[str] | None = None) -> None:
    # Load environment variables from .env if present
    load_dotenv()

    parser = build_arg_parser()
    args = parser.parse_args(argv)

    cfg = load_config(Path(args.config))
    t_path = tasks_path(args.tasks)
    tasks = load_marb_tasks(t_path)

    results = []
    for provider_name in args.providers:
        res = run_marb_for_provider(provider_name, cfg, tasks)
        results.append(res)

    print(format_marb_results(results))


if __name__ == "__main__":
    main()

