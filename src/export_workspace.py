from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.core.services.repository import AppRepository, bootstrap_sample_data
from src.core.storage.json_store import JsonStore


def main() -> None:
    data_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / ".ai-config-manager-demo"
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else data_root / "workspace.json"

    store = JsonStore(data_root)
    if not store.read_collection("profiles"):
        bootstrap_sample_data(store)

    payload = AppRepository(store).get_workspace_snapshot()
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
