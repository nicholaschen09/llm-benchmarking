from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

import yaml

from .clients.exa_client import ExaClient
from .clients.generic_http_client import GenericHTTPClient
from .eval.runner import evaluate_provider, format_results, load_dataset


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Exa ML Troubleshooting Search Benchmark",
    )
    parser.add_argument(
        "--provider",
        action="append",
        dest="providers",
        required=True,
        help="Name of provider(s) to run (must exist in config/providers.yaml). "
        "Can be passed multiple times.",
    )
    parser.add_argument(
        "--dataset",
        default="ml_troubleshooting",
        help="Dataset name (currently only 'ml_troubleshooting' is supported).",
    )
    parser.add_argument(
        "--k",
        type=int,
        default=10,
        help="Evaluate up to top-k results (Hit@k, MRR@k, Recall@k).",
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


def make_provider(name: str, config: dict):
    """
    Instantiate a SearchClient from the YAML config.
    """
    providers_cfg = {p["name"]: p for p in config.get("providers", [])}
    if name not in providers_cfg:
        raise KeyError(f"Provider '{name}' not found in config/providers.yaml")
    cfg = providers_cfg[name]
    ptype = cfg.get("type")

    if ptype == "exa":
        return ExaClient(
            name=name,
            api_key=None,  # pulled from EXA_API_KEY in __post_init__
            base_url=cfg.get("base_url", "https://api.exa.ai/search"),
            default_top_k=int(cfg.get("default_top_k", 10)),
        )
    if ptype == "generic_json_http":
        return GenericHTTPClient(
            name=name,
            base_url=cfg["base_url"],
            method=cfg.get("method", "GET"),
            api_key_env=cfg.get("api_key_env"),
            api_key_header=cfg.get("api_key_header"),
            query_param=cfg.get("query_param", "q"),
            result_path=cfg.get("result_path", "results"),
            url_field=cfg.get("url_field", "url"),
            title_field=cfg.get("title_field", "title"),
            snippet_field=cfg.get("snippet_field", "snippet"),
            score_field=cfg.get("score_field", "score"),
            default_top_k=int(cfg.get("default_top_k", 10)),
        )

    raise ValueError(f"Unknown provider type '{ptype}' for provider '{name}'")


def dataset_path(dataset_name: str) -> Path:
    root = Path(__file__).resolve().parent
    data_dir = root / "datasets"
    if dataset_name == "ml_troubleshooting":
        return data_dir / "ml_troubleshooting.jsonl"
    raise ValueError(f"Unknown dataset '{dataset_name}'")


def main(argv: List[str] | None = None) -> None:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    cfg = load_config(Path(args.config))
    ds_path = dataset_path(args.dataset)
    examples = load_dataset(ds_path)

    results = []
    for provider_name in args.providers:
        provider = make_provider(provider_name, cfg)
        res = evaluate_provider(provider, examples, k=args.k)
        results.append(res)

    print(format_results(results))


if __name__ == "__main__":
    main()


